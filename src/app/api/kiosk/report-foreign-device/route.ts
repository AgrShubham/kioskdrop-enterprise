import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma, ensurePragmas } from "@/lib/prisma";
import { CompartmentStatus } from "@/domain/states";
import { telemetryBus } from "@/lib/telemetry-bus";
import { errorResponse, successResponse } from "@/lib/api-response";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const foreignDeviceSchema = z.object({
  lockerId: z.string().min(1, "Locker ID is required"),
  compartmentNumber: z.number().int().positive(),
  foreignVendorId: z.string().default("0x16C0"),
  foreignProductId: z.string().default("0x05DF"),
  simulatedAttackVector: z
    .string()
    .default("BadUSB Keystroke Injection payload detected"),
});

export async function POST(request: NextRequest) {
  await ensurePragmas();

  try {
    const body = await request.json();
    const parsed = foreignDeviceSchema.parse(body);

    const compartment = await prisma.lockerCompartment.findUnique({
      where: {
        lockerId_compartmentNumber: {
          lockerId: parsed.lockerId,
          compartmentNumber: parsed.compartmentNumber,
        },
      },
      include: { locker: true },
    });

    if (!compartment) {
      return errorResponse(new Error("Compartment not found"), "COMPARTMENT_NOT_FOUND", 404);
    }

    // 1. Quarantine the compartment
    await prisma.lockerCompartment.update({
      where: { id: compartment.id },
      data: {
        status: CompartmentStatus.MAINTENANCE_QUARANTINE,
        solenoidLocked: true,
      },
    });

    // 2. Append immutable tamper-evident custody log
    const lastLog = await prisma.custodyLog.findFirst({
      orderBy: { timestamp: "desc" },
    });
    const prevHash = lastLog?.hash || "0".repeat(64);
    const ts = new Date().toISOString();
    const details = JSON.stringify({
      alarm: "BADUSB_FOREIGN_DEVICE_DETECTED",
      vector: parsed.simulatedAttackVector,
      vid: parsed.foreignVendorId,
      pid: parsed.foreignProductId,
      bay: parsed.compartmentNumber,
    });
    const hash = crypto
      .createHash("sha256")
      .update(`${prevHash}:SECURITY_MISMATCH_ALARM:${ts}:${details}`)
      .digest("hex");

    const auditLog = await prisma.custodyLog.create({
      data: {
        eventType: "SECURITY_MISMATCH_ALARM",
        lockerName: compartment.locker.name,
        compartmentNumber: parsed.compartmentNumber,
        authMethod: "SYSTEM",
        details,
        prevHash,
        hash,
      },
    });

    // 3. Emit real-time SSE event
    telemetryBus.emit("SECURITY_MISMATCH_ALARM", {
      lockerId: parsed.lockerId,
      compartmentNumber: parsed.compartmentNumber,
      foreignVid: parsed.foreignVendorId,
      foreignPid: parsed.foreignProductId,
      attackVector: parsed.simulatedAttackVector,
      auditLogId: auditLog.id,
    });

    return successResponse({
      alarmTriggered: true,
      compartmentStatus: CompartmentStatus.MAINTENANCE_QUARANTINE,
      incidentCode: `SEC-ALARM-${Date.now()}`,
      message:
        "SECURITY ALARM: Unauthorized foreign device profile detected in bay. Solenoid locked and bay quarantined.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
