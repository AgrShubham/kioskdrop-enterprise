import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest) {
  const response = successResponse({
    message: "Logged out successfully",
  });

  response.cookies.set("kioskdrop_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

