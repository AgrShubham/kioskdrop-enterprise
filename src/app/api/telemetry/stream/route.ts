import { NextRequest } from "next/server";
import { telemetryBus } from "@/lib/telemetry-bus";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Ensure session exists
  await getSession();

  const lastEventId = request.headers.get("last-event-id") || undefined;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Replay missed events if client reconnected with Last-Event-ID
      if (lastEventId) {
        const missed = telemetryBus.getEventsSince(lastEventId);
        for (const evt of missed) {
          controller.enqueue(
            encoder.encode(
              `id: ${evt.id}\nevent: ${evt.type}\ndata: ${JSON.stringify(evt)}\n\n`
            )
          );
        }
      }

      // 2. Subscribe to live events
      const unsubscribe = telemetryBus.subscribe((evt) => {
        try {
          controller.enqueue(
            encoder.encode(
              `id: ${evt.id}\nevent: ${evt.type}\ndata: ${JSON.stringify(evt)}\n\n`
            )
          );
        } catch {
          unsubscribe();
        }
      });

      // 3. Heartbeat interval every 15 seconds to keep connection alive
      const heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
        } catch {
          clearInterval(heartbeatTimer);
          unsubscribe();
        }
      }, 15000);

      // 4. Clean up listener on client abort/disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeatTimer);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Stream already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
