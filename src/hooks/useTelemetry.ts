"use client";

import { useEffect, useState } from "react";

export interface TelemetryMessage {
  id: string;
  type: string;
  version: string;
  ts: string;
  payload: any;
}

// Client-side BroadcastChannel for 0ms cross-tab synchronization on serverless
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  broadcastChannel = new BroadcastChannel("kioskdrop-telemetry");
}

export function broadcastClientEvent(type: string, payload: any) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        id: `bc_${Date.now()}`,
        type,
        version: "1.0",
        ts: new Date().toISOString(),
        payload,
      });
    } catch {
      // Channel closed
    }
  }
}

export function useTelemetry(onEvent?: (event: TelemetryMessage) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<TelemetryMessage | null>(null);
  const [events, setEvents] = useState<TelemetryMessage[]>([]);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let fallbackPollInterval: NodeJS.Timeout | null = null;

    // Cross-tab broadcast listener
    const handleBroadcast = (e: MessageEvent) => {
      const data: TelemetryMessage = e.data;
      if (data && data.type) {
        setLastEvent(data);
        setEvents((prev) => [data, ...prev.slice(0, 49)]);
        if (onEvent) onEvent(data);
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener("message", handleBroadcast);
    }

    function connect() {
      try {
        eventSource = new EventSource("/api/telemetry/stream");

        eventSource.onopen = () => {
          setIsConnected(true);
          if (fallbackPollInterval) {
            clearInterval(fallbackPollInterval);
            fallbackPollInterval = null;
          }
        };

        eventSource.onmessage = (e) => {
          try {
            const data: TelemetryMessage = JSON.parse(e.data);
            setLastEvent(data);
            setEvents((prev) => [data, ...prev.slice(0, 49)]);
            if (onEvent) onEvent(data);
          } catch {
            // Heartbeat
          }
        };

        const eventTypes = [
          "LOCKER_RESERVED",
          "DOOR_UNLOCKED",
          "ASSET_REMOVED",
          "ASSET_RETURNED",
          "SECURITY_MISMATCH_ALARM",
          "TICKET_EXPIRED",
          "TICKET_OVERDUE",
          "INVENTORY_RESTOCKED",
        ];

        eventTypes.forEach((type) => {
          eventSource?.addEventListener(type, (e: any) => {
            try {
              const data: TelemetryMessage = JSON.parse(e.data);
              setLastEvent(data);
              setEvents((prev) => [data, ...prev.slice(0, 49)]);
              if (onEvent) onEvent(data);
            } catch {
              // parse error
            }
          });
        });

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();

          // Start adaptive polling fallback if disconnected (e.g. serverless timeout)
          if (!fallbackPollInterval) {
            fallbackPollInterval = setInterval(async () => {
              try {
                const res = await fetch("/api/lockers");
                if (res.ok) {
                  const data = await res.json();
                  const syntheticEvent: TelemetryMessage = {
                    id: `poll_${Date.now()}`,
                    type: "POLL_SYNC",
                    version: "1.0",
                    ts: new Date().toISOString(),
                    payload: data,
                  };
                  if (onEvent) onEvent(syntheticEvent);
                }
              } catch {
                // Ignore transient network errors
              }
            }, 4000);
          }

          reconnectTimeout = setTimeout(connect, 4000);
        };
      } catch {
        setIsConnected(false);
      }
    }

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (fallbackPollInterval) clearInterval(fallbackPollInterval);
      if (eventSource) eventSource.close();
      if (broadcastChannel) {
        broadcastChannel.removeEventListener("message", handleBroadcast);
      }
    };
  }, [onEvent]);

  return { isConnected, lastEvent, events };
}
