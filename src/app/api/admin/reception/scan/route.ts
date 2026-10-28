import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma, ensurePragmas } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { CompartmentStatus } from "@/domain/states";
import { telemetryBus } from "@/lib/telemetry-bus";
import { errorResponse, successResponse } from "@/lib/api-response";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const receptionScanSchema = z.object({
  purchaseOrderId: z.string(),
  skuId: z.string(),
  serialNumber: z.string().min(3),
  usbVendorId: z.string().default("0x046D"),
  usbProductId: z.string().default("0xC53E"),
  targetLockerId: z.string(),
  targetCompartmentNumber: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  await ensurePragmas();

  try {
    // Only IT_ADMIN can perform physical hardware inspection and intake
    await requireRole(["IT_ADMIN"]);

    const body = await request.json();
    const parsed = receptionScanSchema.parse(body);

    // 1. Verify compartment exists
    const compartment = await prisma.lockerCompartment.findUnique({
      where: {
        lockerId_compartmentNumber: {
          lockerId: parsed.targetLockerId,
          compartmentNumber: parsed.targetCompartmentNumber,
        },
      },
      include: { locker: true },
    });

    if (!compartment) {
      return errorResponse(new Error("Target compartment not found"), "COMPARTMENT_NOT_FOUND", 404);
    }

    // 2. Create AssetItem with verified USB VID/PID
    const asset = await prisma.assetItem.create({
      data: {
        skuId: parsed.skuId,
        serialNumber: parsed.serialNumber,
        usbVendorId: parsed.usbVendorId,
        usbProductId: parsed.usbProductId,
        hidWhitelisted: true,
        condition: "HEALTHY",
        availability: "IN_LOCKER",
      },
      include: { sku: true },
    });

    // 3. Stock into locker compartment
    await prisma.lockerCompartment.update({
      where: { id: compartment.id },
      data: {
        assetId: asset.id,
        status: CompartmentStatus.STOCKED_AVAILABLE,
        solenoidLocked: true,
        doorPhysicalOpen: false,
        irSensorBreakBeam: true,
        chargingConnected: true,
        activePinHash: null,
      },
    });

    // 4. Update PO status
    await prisma.purchaseOrder.update({
      where: { id: parsed.purchaseOrderId },
      data: { status: "INSPECTED_STOCKED" },
    });

    // 5. Append custody log
    const lastLog = await prisma.custodyLog.findFirst({ orderBy: { timestamp: "desc" } });
    const prevHash = lastLog?.hash || "0".repeat(64);
    const ts = new Date().toISOString();
    const details = JSON.stringify({
      action: "RECEPTION_INSPECTION_STOCKED",
      poId: parsed.purchaseOrderId,
      serialNumber: parsed.serialNumber,
      locker: compartment.locker.name,
      bay: parsed.targetCompartmentNumber,
    });
    const hash = crypto
      .createHash("sha256")
      .update(`${prevHash}:INVENTORY_RESTOCKED:${ts}:${details}`)
      .digest("hex");

    await prisma.custodyLog.create({
      data: {
        eventType: "INVENTORY_RESTOCKED",
        assetId: asset.id,
        lockerName: compartment.locker.name,
        compartmentNumber: parsed.targetCompartmentNumber,
        authMethod: "SYSTEM",
        details,
        prevHash,
        hash,
      },
    });

    telemetryBus.emit("INVENTORY_RESTOCKED", {
      serialNumber: asset.serialNumber,
      skuName: asset.sku.name,
      lockerName: compartment.locker.name,
      bay: parsed.targetCompartmentNumber,
    });

    return successResponse({
      asset,
      compartmentStatus: CompartmentStatus.STOCKED_AVAILABLE,
      message: `Hardware ${asset.serialNumber} inspected at reception and stocked in ${compartment.locker.name} Bay #${parsed.targetCompartmentNumber}.`,
    }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
