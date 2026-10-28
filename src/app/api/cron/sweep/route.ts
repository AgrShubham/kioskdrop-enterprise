import { NextResponse } from "next/server";
import { cleanupExpiredReservations } from "@/services/reservation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Basic auth check for Vercel Cron header if present
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cleanedCount = await cleanupExpiredReservations();
    return NextResponse.json({
      success: true,
      cleanedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Cron sweep failed" },
      { status: 500 }
    );
  }
}
