"use client";

import { useEffect, useState, useCallback } from "react";

export interface TelemetryMessage {
  id: string;
  type: string;
  version: string;
  ts: string;
  payload: any;
}

export function useTelemetry(onEvent?: (event: TelemetryMessage) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<TelemetryMessage | null>(null);
  const [events, setEvents] = useState<TelemetryMessage[]>([]);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    function connect() {
      eventSource = new EventSource("/api/telemetry/stream");

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (e) => {
        try {
          const data: TelemetryMessage = JSON.parse(e.data);
          setLastEvent(data);
          setEvents((prev) => [data, ...prev.slice(0, 49)]);
          if (onEvent) onEvent(data);
        } catch {
          // Heartbeat or comment
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
        reconnectTimeout = setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (eventSource) eventSource.close();
    };
  }, [onEvent]);

  return { isConnected, lastEvent, events };
}
