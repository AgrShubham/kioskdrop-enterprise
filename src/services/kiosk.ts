import { prisma, ensurePragmas } from "../lib/prisma";
import { verifyPin } from "./pin";
import {
  CompartmentStatus,
  TicketStatus,
  transitionCompartment,
  transitionTicket,
  CompartmentStatusType,
} from "../domain/states";
import crypto from "crypto";

export interface KioskAuthRequest {
  lockerId: string;
  authMethod: "PIN" | "RFID" | "BIOMETRIC";
  credentialValue: string;
}

export interface KioskAuthResponse {
  success: boolean;
  unlockedCompartment: number;
  solenoidReleased: boolean;
  assetSerialNumber: string;
  skuName: string;
  message: string;
}

export interface ReturnAssetRequest {
  lockerId: string;
  compartmentNumber: number;
  assetSerialNumber: string;
  usbVendorId: string;
  usbProductId: string;
  chargingConnected: boolean;
}

export interface ReturnAssetResponse {
  success: boolean;
  ticketClosed: string;
  compartmentStatus: string;
  auditEventId: string;
  message: string;
}

export class AuthenticationFailedError extends Error {
  constructor(message: string = "Authentication failed. Invalid PIN, badge, or credential.") {
    super(message);
    this.name = "AuthenticationFailedError";
  }
}

export class SecurityMismatchAlarmError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityMismatchAlarmError";
  }
}

/**
 * Authenticates user at the Smart Locker Kiosk and releases the solenoid latch.
 */
export async function authenticateAndUnlock(
  request: KioskAuthRequest
): Promise<KioskAuthResponse> {
  await ensurePragmas();

  const { lockerId, authMethod, credentialValue } = request;

  // Find reserved compartments in this locker
  const reservedCompartments = await prisma.lockerCompartment.findMany({
    where: {
      lockerId,
      status: CompartmentStatus.RESERVED_FOR_PICKUP,
    },
    include: {
      asset: { include: { sku: true } },
      locker: true,
      tickets: {
        where: { status: TicketStatus.OPEN_RESERVED },
        include: { user: true },
      },
    },
  });

  if (reservedCompartments.length === 0) {
    throw new AuthenticationFailedError("No active reservations awaiting pickup in this locker.");
  }

  let matchedCompartment = null;
  let matchedTicket = null;

  for (const comp of reservedCompartments) {
    const ticket = comp.tickets[0];
    if (!ticket) continue;

    if (authMethod === "PIN") {
      if (comp.activePinHash && verifyPin(credentialValue, comp.activePinHash)) {
        matchedCompartment = comp;
        matchedTicket = ticket;
        break;
      }
    } else if (authMethod === "RFID") {
      // Must match the ticket owner's corporate RFID badge ID
      if (ticket.user.rfidBadgeId === credentialValue) {
        matchedCompartment = comp;
        matchedTicket = ticket;
        break;
      }
    } else if (authMethod === "BIOMETRIC") {
      // Validates mock biometric template reference
      if (
        ticket.user.biometricTemplateRef &&
        ticket.user.biometricTemplateRef.includes(credentialValue)
      ) {
        matchedCompartment = comp;
        matchedTicket = ticket;
        break;
      }
    }
  }

  if (!matchedCompartment || !matchedTicket || !matchedCompartment.asset) {
    throw new AuthenticationFailedError("Invalid credentials or reservation expired.");
  }

  // Pure state machine check
  transitionCompartment(
    matchedCompartment.status as CompartmentStatusType,
    CompartmentStatus.DOOR_OPEN_AWAITING_REMOVAL
  );

  // Update compartment in DB: release solenoid latch and pop door
  await prisma.lockerCompartment.update({
    where: { id: matchedCompartment.id },
    data: {
      status: CompartmentStatus.DOOR_OPEN_AWAITING_REMOVAL,
      solenoidLocked: false,
      doorPhysicalOpen: true,
    },
  });

  // Log audit trail
  const lastLog = await prisma.custodyLog.findFirst({ orderBy: { timestamp: "desc" } });
  const prevHash = lastLog?.hash || "0".repeat(64);
  const ts = new Date().toISOString();
  const details = JSON.stringify({
    action: "DOOR_UNLOCKED",
    compartmentNumber: matchedCompartment.compartmentNumber,
    authMethod,
    ticketId: matchedTicket.id,
  });
  const hash = crypto
    .createHash("sha256")
    .update(`${prevHash}:DOOR_UNLOCKED:${ts}:${details}`)
    .digest("hex");

  await prisma.custodyLog.create({
    data: {
      eventType: "DOOR_UNLOCKED",
      ticketId: matchedTicket.id,
      userId: matchedTicket.userId,
      assetId: matchedCompartment.asset.id,
      lockerName: matchedCompartment.locker.name,
      compartmentNumber: matchedCompartment.compartmentNumber,
      authMethod,
      details,
      prevHash,
      hash,
    },
  });

  return {
    success: true,
    unlockedCompartment: matchedCompartment.compartmentNumber,
    solenoidReleased: true,
    assetSerialNumber: matchedCompartment.asset.serialNumber,
    skuName: matchedCompartment.asset.sku.name,
    message: `Bay ${matchedCompartment.compartmentNumber} unlocked. Please retrieve your device and close the door.`,
  };
}

/**
 * Simulates physical removal of the device from the bay (IR break-beam sensor).
 */
export async function removeAsset(
  lockerId: string,
  compartmentNumber: number
): Promise<{ success: boolean; message: string }> {
  await ensurePragmas();

  const compartment = await prisma.lockerCompartment.findUnique({
    where: {
      lockerId_compartmentNumber: { lockerId, compartmentNumber },
    },
    include: {
      asset: true,
      locker: true,
      tickets: {
        where: { status: TicketStatus.OPEN_RESERVED },
      },
    },
  });

  if (!compartment || !compartment.asset) {
    throw new Error("Compartment not found or empty.");
  }

  // Pure state machine transition
  transitionCompartment(
    compartment.status as CompartmentStatusType,
    CompartmentStatus.CHECKED_OUT
  );

  const activeTicket = compartment.tickets[0];

  await prisma.$transaction(async (tx) => {
    // 1. Update Compartment: IR beam clear, charging disconnected, solenoid re-latched
    await tx.lockerCompartment.update({
      where: { id: compartment.id },
      data: {
        status: CompartmentStatus.CHECKED_OUT,
        solenoidLocked: true,
        doorPhysicalOpen: false,
        irSensorBreakBeam: false,
        chargingConnected: false,
        activePinHash: null,
      },
    });

    // 2. Update Asset availability to OUT
    await tx.assetItem.update({
      where: { id: compartment.asset!.id },
      data: { availability: "OUT" },
    });

    // 3. Update Ticket to DISPENSED_ACTIVE
    if (activeTicket) {
      transitionTicket(activeTicket.status as any, TicketStatus.DISPENSED_ACTIVE);
      await tx.dispatchTicket.update({
        where: { id: activeTicket.id },
        data: {
          status: TicketStatus.DISPENSED_ACTIVE,
          dispensedAt: new Date(),
        },
      });
    }

    // 4. Log custody event
    const lastLog = await tx.custodyLog.findFirst({ orderBy: { timestamp: "desc" } });
    const prevHash = lastLog?.hash || "0".repeat(64);
    const ts = new Date().toISOString();
    const details = JSON.stringify({
      action: "ASSET_REMOVED",
      bay: compartmentNumber,
      serialNumber: compartment.asset!.serialNumber,
    });
    const hash = crypto
      .createHash("sha256")
      .update(`${prevHash}:ASSET_REMOVED:${ts}:${details}`)
      .digest("hex");

    await tx.custodyLog.create({
      data: {
        eventType: "ASSET_REMOVED",
        ticketId: activeTicket?.id,
        userId: activeTicket?.userId,
        assetId: compartment.asset!.id,
        lockerName: compartment.locker.name,
        compartmentNumber,
        authMethod: "SYSTEM",
        details,
        prevHash,
        hash,
      },
    });
  });

  return {
    success: true,
    message: `Asset removed from bay ${compartmentNumber}. Ticket is now DISPENSED_ACTIVE.`,
  };
}

/**
 * Verifies returned hardware, checks USB VID/PID against whitelist, verifies charging continuity,
 * closes the ticket, and returns bay to STOCKED_AVAILABLE (or MAINTENANCE_QUARANTINE if defective).
 */
export async function returnAsset(
  request: ReturnAssetRequest
): Promise<ReturnAssetResponse> {
  await ensurePragmas();

  const {
    lockerId,
    compartmentNumber,
    assetSerialNumber,
    usbVendorId,
    usbProductId,
    chargingConnected,
  } = request;

  const compartment = await prisma.lockerCompartment.findUnique({
    where: {
      lockerId_compartmentNumber: { lockerId, compartmentNumber },
    },
    include: {
      locker: true,
      asset: { include: { sku: true } },
    },
  });

  if (!compartment) {
    throw new Error(`Compartment ${compartmentNumber} not found in locker.`);
  }

  // Find active ticket for this serial number
  const activeTicket = await prisma.dispatchTicket.findFirst({
    where: {
      status: { in: [TicketStatus.DISPENSED_ACTIVE, TicketStatus.OVERDUE_ESCALATED] },
      asset: { serialNumber: assetSerialNumber },
    },
    include: { asset: true, user: true },
  });

  if (!activeTicket) {
    throw new Error(
      `No active dispatched ticket found for hardware serial ${assetSerialNumber}.`
    );
  }

  // ZERO-TRUST VALIDATION: Verify returned asset's Serial, VID, and PID
  const isMatchingAsset =
    activeTicket.asset.serialNumber === assetSerialNumber &&
    activeTicket.asset.usbVendorId.toLowerCase() === usbVendorId.toLowerCase() &&
    activeTicket.asset.usbProductId.toLowerCase() === usbProductId.toLowerCase();

  if (!isMatchingAsset) {
    // SECURITY MISMATCH ALARM: Unidentified/counterfeit foreign device detected in bay!
    const lastLog = await prisma.custodyLog.findFirst({ orderBy: { timestamp: "desc" } });
    const prevHash = lastLog?.hash || "0".repeat(64);
    const ts = new Date().toISOString();
    const details = JSON.stringify({
      alarm: "SECURITY_MISMATCH_ALARM",
      expected: {
        sn: activeTicket.asset.serialNumber,
        vid: activeTicket.asset.usbVendorId,
        pid: activeTicket.asset.usbProductId,
      },
      received: { sn: assetSerialNumber, vid: usbVendorId, pid: usbProductId },
      bay: compartmentNumber,
    });
    const hash = crypto
      .createHash("sha256")
      .update(`${prevHash}:SECURITY_MISMATCH_ALARM:${ts}:${details}`)
      .digest("hex");

    await prisma.custodyLog.create({
      data: {
        eventType: "SECURITY_MISMATCH_ALARM",
        ticketId: activeTicket.id,
        userId: activeTicket.userId,
        assetId: activeTicket.assetId,
        lockerName: compartment.locker.name,
        compartmentNumber,
        authMethod: "SYSTEM",
        details,
        prevHash,
        hash,
      },
    });

    // Quarantine the bay
    await prisma.lockerCompartment.update({
      where: { id: compartment.id },
      data: {
        status: CompartmentStatus.MAINTENANCE_QUARANTINE,
        solenoidLocked: true,
      },
    });

    throw new SecurityMismatchAlarmError(
      "SECURITY ALARM: Hardware returned does not match expected cryptographic VID/PID/Serial profile. Bay quarantined."
    );
  }

  // CHARGING CONTINUITY CHECK:
  // If charging connection fails, we do NOT strand the user.
  // We accept the return, close the ticket, but flag asset for inspection and quarantine bay.
  const isChargingOk = chargingConnected === true;
  const targetCompartmentStatus = isChargingOk
    ? CompartmentStatus.STOCKED_AVAILABLE
    : CompartmentStatus.MAINTENANCE_QUARANTINE;
  const targetAssetCondition = isChargingOk ? "HEALTHY" : "NEEDS_INSPECTION";

  await prisma.$transaction(async (tx) => {
    // 1. Close the ticket
    transitionTicket(activeTicket.status as any, TicketStatus.RETURNED_CLOSED);
    await tx.dispatchTicket.update({
      where: { id: activeTicket.id },
      data: {
        status: TicketStatus.RETURNED_CLOSED,
        returnedAt: new Date(),
      },
    });

    // 2. Update Asset condition & availability
    await tx.assetItem.update({
      where: { id: activeTicket.assetId },
      data: {
        condition: targetAssetCondition,
        availability: isChargingOk ? "IN_LOCKER" : "QUARANTINED",
      },
    });

    // 3. Update Locker Compartment
    await tx.lockerCompartment.update({
      where: { id: compartment.id },
      data: {
        status: targetCompartmentStatus,
        assetId: activeTicket.assetId,
        solenoidLocked: true,
        doorPhysicalOpen: false,
        irSensorBreakBeam: true,
        chargingConnected: isChargingOk,
        activePinHash: null,
      },
    });

    // 4. Log custody return event
    const lastLog = await tx.custodyLog.findFirst({ orderBy: { timestamp: "desc" } });
    const prevHash = lastLog?.hash || "0".repeat(64);
    const ts = new Date().toISOString();
    const details = JSON.stringify({
      action: "ASSET_RETURNED",
      serialNumber: assetSerialNumber,
      chargingOk: isChargingOk,
      compartmentStatus: targetCompartmentStatus,
      ticketId: activeTicket.id,
    });
    const hash = crypto
      .createHash("sha256")
      .update(`${prevHash}:ASSET_RETURNED:${ts}:${details}`)
      .digest("hex");

    await tx.custodyLog.create({
      data: {
        eventType: "ASSET_RETURNED",
        ticketId: activeTicket.id,
        userId: activeTicket.userId,
        assetId: activeTicket.assetId,
        lockerName: compartment.locker.name,
        compartmentNumber,
        authMethod: "SYSTEM",
        details,
        prevHash,
        hash,
      },
    });
  });

  return {
    success: true,
    ticketClosed: activeTicket.itsmExternalId,
    compartmentStatus: targetCompartmentStatus,
    auditEventId: `log_return_${Date.now()}`,
    message: isChargingOk
      ? "Hardware successfully returned and verified. Solenoid locked. Ticket closed."
      : "Hardware returned. Charging continuity not detected; bay quarantined for IT inspection. Ticket closed.",
  };
}
