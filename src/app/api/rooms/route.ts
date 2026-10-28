import { NextResponse } from "next/server";
import { prisma, ensurePragmas } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await ensurePragmas();

  const rooms = await prisma.meetingRoom.findMany({
    orderBy: { floor: "desc" },
  });

  return NextResponse.json({
    success: true,
    rooms,
  });
}
