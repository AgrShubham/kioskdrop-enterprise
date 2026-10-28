import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateAndUnlock } from "@/services/kiosk";
import { telemetryBus } from "@/lib/telemetry-bus";
import {
  checkLockerLockout,
  recordFailedAttempt,
  resetLockerAttempts,
  LockerLockedOutError,
} from "@/lib/locker-lockout";
import { errorResponse, successResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const authSchema = z.object({
  lockerId: z.string().min(1, "Locker ID is required"),
  authMethod: z.enum(["PIN", "RFID", "BIOMETRIC"]),
  credentialValue: z.string().min(1, "Credential value is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = authSchema.parse(body);

    // 1. Check for active security lockout (HTTP 423)
    checkLockerLockout(parsed.lockerId);

    try {
      // 2. Perform authentication and solenoid unlock
      const result = await authenticateAndUnlock({
        lockerId: parsed.lockerId,
        authMethod: parsed.authMethod,
        credentialValue: parsed.credentialValue,
      });

      // Reset failed counter on success
      resetLockerAttempts(parsed.lockerId);

      // Emit SSE event
      telemetryBus.emit("DOOR_UNLOCKED", {
        lockerId: parsed.lockerId,
        compartmentNumber: result.unlockedCompartment,
        serialNumber: result.assetSerialNumber,
        skuName: result.skuName,
        authMethod: parsed.authMethod,
      });

      return successResponse(result);
    } catch (authError) {
      // Record failed attempt
      const attemptsRemaining = recordFailedAttempt(parsed.lockerId);
      return errorResponse(
        new Error(
          `Invalid credentials. ${attemptsRemaining} attempt(s) remaining before 15-minute lockout.`
        ),
        "AUTH_FAILED",
        401
      );
    }
  } catch (error) {
    if (error instanceof LockerLockedOutError) {
      return errorResponse(error, "LOCKER_LOCKED_OUT", 423);
    }
    return errorResponse(error);
  }
}
