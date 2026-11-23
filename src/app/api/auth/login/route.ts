import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signSession, UserSession } from "@/lib/session";
import { errorResponse, successResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(1).optional(),
  rfidBadgeId: z.string().optional(),
  userId: z.string().optional(),
  role: z.enum(["EMPLOYEE", "IT_ADMIN", "FINOPS_AUDITOR"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = loginSchema.parse(body);

    let targetUser = null;

    if (parsed.userId) {
      targetUser = await prisma.user.findUnique({
        where: { id: parsed.userId },
      });
    } else if (parsed.rfidBadgeId) {
      targetUser = await prisma.user.findUnique({
        where: { rfidBadgeId: parsed.rfidBadgeId.trim() },
      });
    } else if (parsed.email) {
      targetUser = await prisma.user.findUnique({
        where: { email: parsed.email.trim().toLowerCase() },
      });
    } else if (parsed.role) {
      targetUser = await prisma.user.findFirst({
        where: { role: parsed.role },
      });
    }

    if (!targetUser) {
      return errorResponse(
        new Error("Invalid credentials. User identity could not be verified."),
        "INVALID_CREDENTIALS",
        401
      );
    }

    const sessionData: UserSession = {
      userId: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      department: targetUser.department,
      role: targetUser.role as "EMPLOYEE" | "IT_ADMIN" | "FINOPS_AUDITOR",
      rfidBadgeId: targetUser.rfidBadgeId,
    };

    const token = signSession(sessionData);

    const response = successResponse({
      message: `Authenticated as ${targetUser.name} (${targetUser.role})`,
      session: sessionData,
      token,
    });

    response.cookies.set("kioskdrop_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}

