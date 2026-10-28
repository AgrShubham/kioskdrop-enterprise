import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma, ensurePragmas } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { errorResponse, successResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await ensurePragmas();

  try {
    await requireRole(["IT_ADMIN"]);

    const events = await prisma.webhookEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return successResponse({ events });
  } catch (error) {
    return errorResponse(error);
  }
}

const replaySchema = z.object({
  webhookEventId: z.string(),
});

export async function POST(request: NextRequest) {
  await ensurePragmas();

  try {
    await requireRole(["IT_ADMIN"]);

    const body = await request.json();
    const { webhookEventId } = replaySchema.parse(body);

    const original = await prisma.webhookEvent.findUnique({
      where: { id: webhookEventId },
    });

    if (!original) {
      return errorResponse(new Error("Original webhook event not found"), "EVENT_NOT_FOUND", 404);
    }

    // Clone and execute simulated replay
    const replayed = await prisma.webhookEvent.create({
      data: {
        direction: original.direction,
        source: original.source,
        externalEventId: `REPLAY-${original.externalEventId || Date.now()}`,
        payload: original.payload,
        signatureValid: original.signatureValid,
        latencyMs: 42,
        status: "REPLAYED",
        replayOfId: original.id,
      },
    });

    return successResponse({
      replayed,
      message: `Webhook event ${original.id} replayed successfully.`,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
