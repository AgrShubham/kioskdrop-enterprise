import crypto from "crypto";

export interface TelemetryEvent {
  id: string;
  type:
    | "LOCKER_RESERVED"
    | "DOOR_UNLOCKED"
    | "ASSET_REMOVED"
    | "ASSET_RETURNED"
    | "SECURITY_MISMATCH_ALARM"
    | "TICKET_EXPIRED"
    | "TICKET_OVERDUE"
    | "INVENTORY_RESTOCKED";
  version: "1.0";
  ts: string;
  payload: any;
}

type TelemetryListener = (event: TelemetryEvent) => void;

class TelemetryBus {
  private listeners: Set<TelemetryListener> = new Set();
  private history: TelemetryEvent[] = [];
  private maxHistory: number = 50;

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public emit(type: TelemetryEvent["type"], payload: any): TelemetryEvent {
    const event: TelemetryEvent = {
      id: `evt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
      type,
      version: "1.0",
      ts: new Date().toISOString(),
      payload,
    };

    // Keep bounded history for Last-Event-ID replay
    this.history.push(event);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Broadcast to all active SSE subscribers
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch {
        // Silently ignore dead client stream error
      }
    });

    return event;
  }

  public getEventsSince(lastEventId?: string): TelemetryEvent[] {
    if (!lastEventId) return [];
    const index = this.history.findIndex((e) => e.id === lastEventId);
    if (index === -1) return [];
    return this.history.slice(index + 1);
  }
}

// Global singleton instance across Next.js dev server hot-reloads
const globalForBus = globalThis as unknown as {
  telemetryBus: TelemetryBus | undefined;
};

export const telemetryBus = globalForBus.telemetryBus ?? new TelemetryBus();

if (process.env.NODE_ENV !== "production") {
  globalForBus.telemetryBus = telemetryBus;
}
