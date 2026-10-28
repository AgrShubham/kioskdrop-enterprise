import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signSession, UserSession } from "@/lib/session";
import { errorResponse, successResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const switchRoleSchema = z.object({
  role: z.enum(["EMPLOYEE", "IT_ADMIN", "FINOPS_AUDITOR"]).optional(),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, userId } = switchRoleSchema.parse(body);

    let targetUser = null;
    if (userId) {
      targetUser = await prisma.user.findUnique({ where: { id: userId } });
    } else if (role) {
      targetUser = await prisma.user.findFirst({ where: { role } });
    }

    if (!targetUser) {
      return errorResponse(new Error("Target persona not found"), "USER_NOT_FOUND", 404);
    }

    const sessionData: UserSession = {
      userId: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      department: targetUser.department,
      role: targetUser.role as any,
      rfidBadgeId: targetUser.rfidBadgeId,
    };

    const token = signSession(sessionData);

    const response = successResponse({
      message: `Switched active persona to ${targetUser.name} (${targetUser.role})`,
      session: sessionData,
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
