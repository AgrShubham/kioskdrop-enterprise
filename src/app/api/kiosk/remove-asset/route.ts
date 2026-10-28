import { NextRequest } from "next/server";
import { z } from "zod";
import { removeAsset } from "@/services/kiosk";
import { telemetryBus } from "@/lib/telemetry-bus";
import { errorResponse, successResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const removeSchema = z.object({
  lockerId: z.string().min(1, "Locker ID is required"),
  compartmentNumber: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lockerId, compartmentNumber } = removeSchema.parse(body);

    const result = await removeAsset(lockerId, compartmentNumber);

    telemetryBus.emit("ASSET_REMOVED", {
      lockerId,
      compartmentNumber,
      timestamp: new Date().toISOString(),
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
