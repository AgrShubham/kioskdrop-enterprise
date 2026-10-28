import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ForbiddenError, UnauthorizedError } from "./session";
import { NoStockAvailableError } from "../services/reservation";
import {
  AuthenticationFailedError,
  SecurityMismatchAlarmError,
} from "../services/kiosk";
import { InvalidTransitionError } from "../domain/states";
import crypto from "crypto";

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      ...data,
      requestId: `req_${crypto.randomBytes(6).toString("hex")}`,
    },
    { status }
  );
}

export function errorResponse(
  error: unknown,
  customCode?: string,
  overrideStatus?: number
) {
  const requestId = `req_${crypto.randomBytes(6).toString("hex")}`;

  // 1. Zod Validation Error -> 400
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: error.flatten().fieldErrors,
        },
        requestId,
      },
      { status: 400 }
    );
  }

  // 2. Unauthorized -> 401
  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: error.message,
          details: {},
        },
        requestId,
      },
      { status: 401 }
    );
  }

  // 3. Forbidden (RBAC) -> 403
  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: error.message,
          details: {},
        },
        requestId,
      },
      { status: 403 }
    );
  }

  // 4. Out of Stock -> 409
  if (error instanceof NoStockAvailableError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NO_STOCK",
          message: error.message,
          details: {},
        },
        requestId,
      },
      { status: 409 }
    );
  }

  // 5. Invalid State Transition -> 409
  if (error instanceof InvalidTransitionError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_STATE_TRANSITION",
          message: error.message,
          details: { entity: error.entity, from: error.fromState, to: error.toState },
        },
        requestId,
      },
      { status: 409 }
    );
  }

  // 6. Security Mismatch Alarm -> 409
  if (error instanceof SecurityMismatchAlarmError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SECURITY_MISMATCH_ALARM",
          message: error.message,
          details: {},
        },
        requestId,
      },
      { status: 409 }
    );
  }

  // 7. Authentication Failed -> 401
  if (error instanceof AuthenticationFailedError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "AUTH_FAILED",
          message: error.message,
          details: {},
        },
        requestId,
      },
      { status: 401 }
    );
  }

  // 8. Custom override
  if (overrideStatus) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: customCode || "ERROR",
          message: error instanceof Error ? error.message : String(error),
          details: {},
        },
        requestId,
      },
      { status: overrideStatus }
    );
  }

  // 9. Standard Error -> 500 (Never leak stack traces)
  const message = error instanceof Error ? error.message : "An unexpected server error occurred.";
  return NextResponse.json(
    {
      success: false,
      error: {
        code: customCode || "INTERNAL_SERVER_ERROR",
        message,
        details: {},
      },
      requestId,
    },
    { status: 500 }
  );
}
