import { prisma } from "../src/lib/prisma";
import { createRealtime, rawSql } from "@neon/realtime/server";

async function runNeonVerification() {
  console.log("=================================================");
  console.log("🚀 STARTING NEON BACKEND SERVICES VERIFICATION");
  console.log("=================================================\n");

  // 1. Verify Neon Lakebase Postgres via Prisma
  console.log("--- 1. Testing Neon Lakebase Postgres (Prisma ORM) ---");
  const startTime = Date.now();
  
  try {
    const userCount = await prisma.user.count();
    const lockerCount = await prisma.smartLocker.count();
    const compartmentCount = await prisma.lockerCompartment.count();
    const skuCount = await prisma.hardwareSKU.count();

    const dbLatency = Date.now() - startTime;
    console.log(`✓ Connected to Neon PostgreSQL! (Latency: ${dbLatency}ms)`);
    console.log(`✓ Verified Database State:`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Smart Lockers: ${lockerCount}`);
    console.log(`   - Compartments: ${compartmentCount}`);
    console.log(`   - Hardware SKUs: ${skuCount}`);

    // Perform an atomic query test
    const lockers = await prisma.smartLocker.findMany({
      include: {
        compartments: {
          take: 2,
        },
      },
    });
    console.log(`✓ Sample Locker: "${lockers[0]?.name}" (Floor ${lockers[0]?.floor}) with ${lockers[0]?.compartments.length} compartments inspected.`);
  } catch (error: any) {
    console.error("❌ Neon Postgres verification failed:", error);
    process.exit(1);
  }

  // 2. Verify Neon Realtime (Live SQL engine)
  console.log("\n--- 2. Testing Neon Realtime Service ---");
  const realtimeSecret = process.env.NEON_REALTIME_SECRET;
  const realtimeUrl = process.env.NEON_REALTIME_URL;

  console.log(`Realtime URL: ${realtimeUrl}`);
  console.log(`Realtime Secret: ${realtimeSecret ? "Present (masked)" : "MISSING"}`);

  if (!realtimeSecret || !realtimeUrl) {
    throw new Error("Missing NEON_REALTIME_SECRET or NEON_REALTIME_URL in environment.");
  }

  try {
    const realtime = createRealtime({
      secret: realtimeSecret,
      url: realtimeUrl,
      db: "neondb",
    });

    console.log("✓ Neon Realtime server instance initialized.");

    // Define and seal a live query on LockerCompartment
    const liveLockersQuery = rawSql<{
      id: string;
      status: string;
      compartmentNumber: number;
    }>(
      `SELECT id, status, "compartmentNumber" FROM "LockerCompartment" ORDER BY "compartmentNumber" ASC LIMIT 10`
    );

    const sealed = await realtime.seal({ query: liveLockersQuery });
    console.log("✓ Query successfully sealed with NEON_REALTIME_SECRET!");
    console.log("   - Sealed query keys:", Object.keys(sealed));
    console.log("   - Sealed query payload:", JSON.stringify(sealed, null, 2));

    console.log("\n=================================================");
    console.log("🎉 ALL NEON SERVICES VERIFIED AND OPERATIONAL!");
    console.log("=================================================");
  } catch (error: any) {
    console.error("❌ Neon Realtime verification failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runNeonVerification().catch((err) => {
  console.error("Verification script failed:", err);
  process.exit(1);
});
