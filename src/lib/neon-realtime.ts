import { createRealtime, rawSql } from "@neon/realtime/server";

const realtimeSecret = process.env.NEON_REALTIME_SECRET;
const realtimeUrl = process.env.NEON_REALTIME_URL;

/**
 * Neon Realtime server instance initialized with branch credentials.
 * Used to seal live SQL queries for secure, authenticated client subscriptions.
 */
export const neonRealtime = realtimeSecret
  ? createRealtime({
      secret: realtimeSecret,
      db: "neondb",
      ...(realtimeUrl ? { url: realtimeUrl } : {}),
    })
  : null;

/**
 * Seals a live query for locker compartments.
 * Allows the Kiosk Simulator and Admin Dashboard to subscribe to real-time physical locker state.
 */
export async function sealLockerCompartmentsLiveQuery(lockerId?: string) {
  if (!neonRealtime) {
    throw new Error("Neon Realtime is not configured (missing NEON_REALTIME_SECRET).");
  }

  const query = lockerId
    ? rawSql<{
        id: string;
        lockerId: string;
        compartmentNumber: number;
        status: string;
        solenoidLocked: boolean;
        doorPhysicalOpen: boolean;
        irSensorBreakBeam: boolean;
        chargingConnected: boolean;
      }>(
        `SELECT id, "lockerId", "compartmentNumber", status, "solenoidLocked", "doorPhysicalOpen", "irSensorBreakBeam", "chargingConnected" 
         FROM "LockerCompartment" 
         WHERE "lockerId" = $1 
         ORDER BY "compartmentNumber" ASC`,
        [lockerId]
      )
    : rawSql<{
        id: string;
        lockerId: string;
        compartmentNumber: number;
        status: string;
        solenoidLocked: boolean;
        doorPhysicalOpen: boolean;
        irSensorBreakBeam: boolean;
        chargingConnected: boolean;
      }>(
        `SELECT id, "lockerId", "compartmentNumber", status, "solenoidLocked", "doorPhysicalOpen", "irSensorBreakBeam", "chargingConnected" 
         FROM "LockerCompartment" 
         ORDER BY "compartmentNumber" ASC`
      );

  const sealed = await neonRealtime.seal({ query });

  return {
    ...sealed,
    realtimeUrl: process.env.NEXT_PUBLIC_NEON_REALTIME_URL || realtimeUrl,
  };
}
