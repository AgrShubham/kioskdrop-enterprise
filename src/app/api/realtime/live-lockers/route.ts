import { NextRequest, NextResponse } from "next/server";
import { sealLockerCompartmentsLiveQuery } from "@/lib/neon-realtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lockerId = searchParams.get("lockerId") || undefined;

    const sealedResult = await sealLockerCompartmentsLiveQuery(lockerId);

    return NextResponse.json({
      success: true,
      data: sealedResult,
      service: "neon-realtime",
      branch: process.env.NEON_BRANCH || "production",
    });
  } catch (error: any) {
    console.error("Failed to generate Neon Realtime sealed query:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to seal live query",
      },
      { status: 500 }
    );
  }
}
