import { NextRequest } from "next/server";
import { prisma, ensurePragmas } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  await ensurePragmas();

  const startTs = Date.now();
  try {
    const rawBody = await request.text();
    const externalEventId = `ZD-EVT-${Date.now()}`;

    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        direction: "INBOUND",
        source: "ZENDESK",
        externalEventId,
        payload: rawBody || JSON.stringify({ event: "ticket.solved", id: "zd_mock_992" }),
        signatureValid: true,
        latencyMs: Date.now() - startTs,
        status: "SUCCESS",
      },
    });

    return successResponse({
      received: true,
      eventId: webhookEvent.id,
      externalEventId,
      status: webhookEvent.status,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
