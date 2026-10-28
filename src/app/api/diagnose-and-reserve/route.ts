import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { reserveEquipment } from "@/services/reservation";
import { telemetryBus } from "@/lib/telemetry-bus";
import { errorResponse, successResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const diagnoseAndReserveSchema = z
  .object({
    meetingRoomId: z.string().optional(),
    qrCodeSlug: z.string().optional(),
    symptomCode: z.string().min(1, "Symptom code is required"),
    portDamaged: z.boolean().optional(),
    preferredSkuId: z.string().nullable().optional(),
  })
  .refine((data) => data.meetingRoomId || data.qrCodeSlug, {
    message: "Either meetingRoomId or qrCodeSlug must be provided",
  });

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const parsed = diagnoseAndReserveSchema.parse(body);

    const idempotencyKey =
      request.headers.get("idempotency-key") || undefined;

    // Resolve room by ID or qrCodeSlug
    let room = null;
    if (parsed.meetingRoomId) {
      room = await prisma.meetingRoom.findUnique({
        where: { id: parsed.meetingRoomId },
      });
    } else if (parsed.qrCodeSlug) {
      room = await prisma.meetingRoom.findUnique({
        where: { qrCodeSlug: parsed.qrCodeSlug },
      });
    }

    if (!room) {
      return errorResponse(new Error("Meeting room not found"), "ROOM_NOT_FOUND", 404);
    }

    // Call reservation service (atomic transaction)
    const result = await reserveEquipment({
      userId: session.userId,
      meetingRoomId: room.id,
      symptomCode: parsed.symptomCode,
      portDamaged: parsed.portDamaged,
      preferredSkuId: parsed.preferredSkuId,
      idempotencyKey,
    });

    // Emit real-time SSE event to update kiosk and admin dashboards
    telemetryBus.emit("LOCKER_RESERVED", {
      ticketId: result.ticketId,
      itsmTicketNumber: result.itsmTicketNumber,
      lockerId: result.locker.id,
      compartmentNumber: result.locker.compartmentNumber,
      roomName: room.name,
      allocatedSku: result.allocatedAsset.skuName,
      userId: session.userId,
    });

    return successResponse(result, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
