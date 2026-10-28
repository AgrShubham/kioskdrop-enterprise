export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const globalForSweeper = globalThis as unknown as {
      sweeperInitialized: boolean | undefined;
    };

    if (globalForSweeper.sweeperInitialized) return;
    globalForSweeper.sweeperInitialized = true;

    // Dynamically import reservation service to avoid circular dependencies on boot
    const { cleanupExpiredReservations } = await import("./services/reservation");
    const { telemetryBus } = await import("./lib/telemetry-bus");

    console.log("⏱️  KioskDrop background TTL reservation sweeper initialized.");

    // Run active sweeper every 30 seconds
    setInterval(async () => {
      try {
        const expiredCount = await cleanupExpiredReservations();
        if (expiredCount > 0) {
          telemetryBus.emit("TICKET_EXPIRED", {
            count: expiredCount,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err) {
        // Silently handle error during shutdown or hot-reload
      }
    }, 30000);
  }
}
