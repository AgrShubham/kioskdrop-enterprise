import { NextRequest } from "next/server";
import { z } from "zod";
import { returnAsset, SecurityMismatchAlarmError } from "@/services/kiosk";
import { telemetryBus } from "@/lib/telemetry-bus";
import { errorResponse, successResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const returnSchema = z.object({
  lockerId: z.string().min(1, "Locker ID is required"),
  compartmentNumber: z.number().int().positive(),
  assetSerialNumber: z.string().min(1, "Asset serial number is required"),
  usbVendorId: z.string().min(1, "USB Vendor ID is required"),
  usbProductId: z.string().min(1, "USB Product ID is required"),
  chargingConnected: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = returnSchema.parse(body);

    try {
      const result = await returnAsset(parsed);

      telemetryBus.emit("ASSET_RETURNED", {
        lockerId: parsed.lockerId,
        compartmentNumber: parsed.compartmentNumber,
        serialNumber: parsed.assetSerialNumber,
        chargingOk: parsed.chargingConnected,
        ticketClosed: result.ticketClosed,
      });

      return successResponse(result);
    } catch (serviceError) {
      if (serviceError instanceof SecurityMismatchAlarmError) {
        telemetryBus.emit("SECURITY_MISMATCH_ALARM", {
          lockerId: parsed.lockerId,
          compartmentNumber: parsed.compartmentNumber,
          submittedSerial: parsed.assetSerialNumber,
          submittedVid: parsed.usbVendorId,
          submittedPid: parsed.usbProductId,
          reason: serviceError.message,
        });
      }
      throw serviceError;
    }
  } catch (error) {
    return errorResponse(error);
  }
}
