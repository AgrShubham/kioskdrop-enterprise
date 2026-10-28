import { prisma, ensurePragmas } from "../lib/prisma";
import { diagnoseSymptom } from "./triage";
import { generateSecurePin, hashPin } from "./pin";
import { CompartmentStatus, TicketStatus } from "../domain/states";
import crypto from "crypto";

export interface ReservationRequest {
  userId: string;
  meetingRoomId: string;
  symptomCode: string;
  portDamaged?: boolean;
  preferredSkuId?: string | null;
  idempotencyKey?: string | null;
}

export interface ReservationResponse {
  ticketId: string;
  itsmTicketNumber: string;
  locker: {
    id: string;
    name: string;
    floor: number;
    compartmentNumber: number;
  };
  allocatedAsset: {
    id: string;
    serialNumber: string;
    skuName: string;
    usbVendorId: string;
    usbProductId: string;
  };
  accessPin: string;
  expiresAt: string;
}

export class NoStockAvailableError extends Error {
  constructor(message: string = "No whitelisted hardware available for the diagnosed symptom.") {
    super(message);
    this.name = "NoStockAvailableError";
  }
}

/**
 * Retries a database operation when SQLite returns SQLITE_BUSY / database is locked or timed out.
 */
async function withSqliteRetry<T>(fn: () => Promise<T>, maxRetries = 20): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      const msg = err?.message || "";
      const isBusy =
        msg.includes("database is locked") ||
        msg.includes("SQLITE_BUSY") ||
        msg.includes("Operations timed out") ||
        err?.code === "P2034" ||
        err?.code === "P2028" ||
        err?.code === "P1008";

      if (isBusy && attempt < maxRetries) {
        // Jittered backoff between 30ms and 180ms
        const delay = 30 + Math.floor(Math.random() * 60) + attempt * 20;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
}

/**
 * Lazy cleanup of expired reservations.
 * Runs before reservation, kiosk authentication, or listing operations.
 */
export async function cleanupExpiredReservations(): Promise<number> {
  return withSqliteRetry(async () => {
    const now = new Date();
    const expiredTickets = await prisma.dispatchTicket.findMany({
      where: {
        status: TicketStatus.OPEN_RESERVED,
        expiresAt: { lt: now },
      },
      include: { compartment: true },
    });

    if (expiredTickets.length === 0) return 0;

    for (const ticket of expiredTickets) {
      await prisma.$transaction(
        async (tx) => {
          await tx.dispatchTicket.update({
            where: { id: ticket.id },
            data: { status: TicketStatus.EXPIRED },
          });

          await tx.lockerCompartment.update({
            where: { id: ticket.compartmentId },
            data: {
              status: CompartmentStatus.STOCKED_AVAILABLE,
              activePinHash: null,
            },
          });

          const lastLog = await tx.custodyLog.findFirst({
            orderBy: { timestamp: "desc" },
          });
          const prevHash = lastLog?.hash || "0".repeat(64);
          const ts = new Date().toISOString();
          const details = JSON.stringify({
            reason: "Reservation TTL expired without pickup",
            ticketId: ticket.id,
          });
          const hash = crypto
            .createHash("sha256")
            .update(`${prevHash}:TICKET_EXPIRED:${ts}:${details}`)
            .digest("hex");

          await tx.custodyLog.create({
            data: {
              eventType: "TICKET_EXPIRED",
              ticketId: ticket.id,
              userId: ticket.userId,
              assetId: ticket.assetId,
              lockerName: "System Sweeper",
              compartmentNumber: ticket.compartment.compartmentNumber,
              authMethod: "SYSTEM",
              details,
              prevHash,
              hash,
            },
          });
        },
        { maxWait: 10000, timeout: 15000 }
      );
    }

    return expiredTickets.length;
  });
}

/**
 * Executes an atomic, race-condition-free locker reservation.
 */
export async function reserveEquipment(
  request: ReservationRequest
): Promise<ReservationResponse> {
  await ensurePragmas();

  return withSqliteRetry(async () => {
    // 1. Run lazy expiry cleanup
    await cleanupExpiredReservations();

    // 2. Check Idempotency Key
    if (request.idempotencyKey) {
      const existing = await prisma.dispatchTicket.findUnique({
        where: { idempotencyKey: request.idempotencyKey },
        include: {
          compartment: { include: { locker: true } },
          asset: { include: { sku: true } },
        },
      });

      if (existing && existing.status === TicketStatus.OPEN_RESERVED) {
        return {
          ticketId: existing.id,
          itsmTicketNumber: existing.itsmExternalId,
          locker: {
            id: existing.compartment.locker.id,
            name: existing.compartment.locker.name,
            floor: existing.compartment.locker.floor,
            compartmentNumber: existing.compartment.compartmentNumber,
          },
          allocatedAsset: {
            id: existing.asset.id,
            serialNumber: existing.asset.serialNumber,
            skuName: existing.asset.sku.name,
            usbVendorId: existing.asset.usbVendorId,
            usbProductId: existing.asset.usbProductId,
          },
          accessPin: "******",
          expiresAt: existing.expiresAt.toISOString(),
        };
      }
    }

    // 3. Resolve Meeting Room
    const room = await prisma.meetingRoom.findUnique({
      where: { id: request.meetingRoomId },
    });
    if (!room) {
      throw new Error(`Meeting room not found: ${request.meetingRoomId}`);
    }

    // 4. Run Symptom Triage Engine
    const triage = diagnoseSymptom({
      symptomCode: request.symptomCode,
      meetingRoom: room,
      portDamaged: request.portDamaged,
      preferredSkuId: request.preferredSkuId,
    });

    const targetSkuIds = [triage.primarySkuId];
    if (triage.secondarySkuId) {
      targetSkuIds.push(triage.secondarySkuId);
    }

    // 5. Query candidate lockers ordered by floor proximity
    const lockers = await prisma.smartLocker.findMany({
      where: { onlineStatus: true },
    });

    if (lockers.length === 0) {
      throw new NoStockAvailableError("No online smart lockers available.");
    }

    lockers.sort(
      (a, b) => Math.abs(a.floor - room.floor) - Math.abs(b.floor - room.floor)
    );

    const rawPin = generateSecurePin();
    const pinHash = hashPin(rawPin);
    const ttlMinutes = parseInt(process.env.RESERVATION_TTL_MINUTES || "10", 10);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    const returnDueHours = parseInt(process.env.RETURN_DUE_HOURS || "4", 10);
    const dueAt = new Date(Date.now() + returnDueHours * 60 * 60 * 1000);

    // 6. Attempt atomic conditional acquisition
    for (const skuId of targetSkuIds) {
      for (const locker of lockers) {
        const candidates = await prisma.lockerCompartment.findMany({
          where: {
            lockerId: locker.id,
            status: CompartmentStatus.STOCKED_AVAILABLE,
            asset: {
              skuId: skuId,
              hidWhitelisted: true,
              condition: "HEALTHY",
              availability: "IN_LOCKER",
            },
          },
          include: {
            asset: { include: { sku: true } },
            locker: true,
          },
        });

        for (const candidate of candidates) {
          if (!candidate.asset) continue;

          // Atomic conditional update
          const claimed = await prisma.$transaction(
            async (tx) => {
              const updateResult = await tx.lockerCompartment.updateMany({
                where: {
                  id: candidate.id,
                  status: CompartmentStatus.STOCKED_AVAILABLE,
                },
                data: {
                  status: CompartmentStatus.RESERVED_FOR_PICKUP,
                  activePinHash: pinHash,
                },
              });

              if (updateResult.count === 0) {
                return null;
              }

              await tx.assetItem.update({
                where: { id: candidate.asset!.id },
                data: { availability: "RESERVED" },
              });

              const incidentNumber = `INC00${Math.floor(100000 + Math.random() * 900000)}`;

              const ticket = await tx.dispatchTicket.create({
                data: {
                  itsmExternalId: incidentNumber,
                  userId: request.userId,
                  meetingRoomId: room.id,
                  assetId: candidate.asset!.id,
                  compartmentId: candidate.id,
                  reportedSymptom: request.symptomCode,
                  accessPinHash: pinHash,
                  idempotencyKey: request.idempotencyKey || null,
                  status: TicketStatus.OPEN_RESERVED,
                  expiresAt,
                  dueAt,
                },
              });

              const lastLog = await tx.custodyLog.findFirst({
                orderBy: { timestamp: "desc" },
              });
              const prevHash = lastLog?.hash || "0".repeat(64);
              const ts = new Date().toISOString();
              const details = JSON.stringify({
                ticketId: ticket.id,
                itsmId: incidentNumber,
                room: room.name,
                symptom: request.symptomCode,
                sku: candidate.asset!.sku.name,
              });
              const hash = crypto
                .createHash("sha256")
                .update(`${prevHash}:RESERVED:${ts}:${details}`)
                .digest("hex");

              await tx.custodyLog.create({
                data: {
                  eventType: "RESERVED",
                  ticketId: ticket.id,
                  userId: request.userId,
                  assetId: candidate.asset!.id,
                  lockerName: locker.name,
                  compartmentNumber: candidate.compartmentNumber,
                  authMethod: "PIN",
                  details,
                  prevHash,
                  hash,
                },
              });

              return {
                ticketId: ticket.id,
                itsmTicketNumber: incidentNumber,
                locker: {
                  id: locker.id,
                  name: locker.name,
                  floor: locker.floor,
                  compartmentNumber: candidate.compartmentNumber,
                },
                allocatedAsset: {
                  id: candidate.asset!.id,
                  serialNumber: candidate.asset!.serialNumber,
                  skuName: candidate.asset!.sku.name,
                  usbVendorId: candidate.asset!.usbVendorId,
                  usbProductId: candidate.asset!.usbProductId,
                },
                accessPin: rawPin,
                expiresAt: expiresAt.toISOString(),
              };
            },
            {
              maxWait: 10000,
              timeout: 15000,
            }
          );

          if (claimed) {
            return claimed;
          }
        }
      }
    }

    throw new NoStockAvailableError();
  });
}
