import { NextResponse } from "next/server";
import { prisma, ensurePragmas } from "@/lib/prisma";
import { cleanupExpiredReservations } from "@/services/reservation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await ensurePragmas();
  // Run lazy cleanup so returned state is always fresh
  await cleanupExpiredReservations();

  const lockers = await prisma.smartLocker.findMany({
    include: {
      compartments: {
        orderBy: { compartmentNumber: "asc" },
        include: {
          asset: {
            include: { sku: true },
          },
          tickets: {
            where: { status: "OPEN_RESERVED" },
            include: { user: true, meetingRoom: true },
          },
        },
      },
    },
    orderBy: { floor: "desc" },
  });

  return NextResponse.json({
    success: true,
    lockers,
  });
}
