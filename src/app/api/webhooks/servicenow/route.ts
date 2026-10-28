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
    const signature = request.headers.get("x-servicenow-signature") || "valid_signature";
    const externalEventId = `SN-EVT-${Date.now()}`;

    // Verify signature (mock validation)
    const signatureValid = signature.length > 5;

    // Log the webhook event
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        direction: "INBOUND",
        source: "SERVICENOW",
        externalEventId,
        payload: rawBody || JSON.stringify({ event: "incident.updated", sys_id: "inc_mock_123" }),
        signatureValid,
        latencyMs: Date.now() - startTs,
        status: signatureValid ? "SUCCESS" : "FAILED",
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
