import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../src/lib/prisma";
import { reserveEquipment, NoStockAvailableError } from "../src/services/reservation";
import { CompartmentStatus, TicketStatus } from "../src/domain/states";

describe("Concurrency & Race-Condition Resistance", () => {
  const testRoomId = "room_concurrency_test";
  const testLockerId = "lkr_concurrency_test";
  const testSkuId = "sku_concurrency_test";
  const testAssetId = "ast_concurrency_single";
  const testCompartmentId = "cmpt_concurrency_single";

  beforeAll(async () => {
    // 1. Get or create a tariff rate
    const tariff = await prisma.tariffRate.findFirstOrThrow();

    // 2. Create isolated SKU with EXACTLY ONE ASSET in the entire system
    const sku = await prisma.hardwareSKU.upsert({
      where: { id: testSkuId },
      create: {
        id: testSkuId,
        name: "Single Allocation Micro-Converter",
        brand: "TestBrand",
        modelNumber: "TB-001",
        category: "DISPLAY_CONVERTER",
        wholesalePricePaise: 50000,
        retailPricePaise: 150000,
        tariffRateId: tariff.id,
        dpAltMode: true,
      },
      update: {},
    });

    // 3. Create isolated Meeting Room on Floor 99
    await prisma.meetingRoom.upsert({
      where: { id: testRoomId },
      create: {
        id: testRoomId,
        name: "High-Contention Boardroom 99X",
        floor: 99,
        building: "Test Tower",
        displayType: "4K_LED_WALL",
        roomSystem: "BYOD_LEGACY",
        qrCodeSlug: "Contention-99X",
      },
      update: {},
    });

    // 4. Create isolated Smart Locker on Floor 99
    await prisma.smartLocker.upsert({
      where: { id: testLockerId },
      create: {
        id: testLockerId,
        name: "Floor 99 Test Locker",
        floor: 99,
        locationNote: "Test Bay",
        onlineStatus: true,
      },
      update: {},
    });

    // 5. Create EXACTLY ONE Asset and ONE Compartment on Floor 99
    await prisma.assetItem.upsert({
      where: { id: testAssetId },
      create: {
        id: testAssetId,
        skuId: sku.id,
        serialNumber: "SN-CONCURRENCY-SINGLE-99",
        usbVendorId: "0x291A",
        usbProductId: "0xA102",
        hidWhitelisted: true,
        condition: "HEALTHY",
        availability: "IN_LOCKER",
      },
      update: {
        availability: "IN_LOCKER",
        condition: "HEALTHY",
      },
    });

    await prisma.lockerCompartment.upsert({
      where: { id: testCompartmentId },
      create: {
        id: testCompartmentId,
        lockerId: testLockerId,
        compartmentNumber: 1,
        status: CompartmentStatus.STOCKED_AVAILABLE,
        assetId: testAssetId,
        solenoidLocked: true,
        doorPhysicalOpen: false,
        irSensorBreakBeam: true,
        chargingConnected: true,
      },
      update: {
        status: CompartmentStatus.STOCKED_AVAILABLE,
        activePinHash: null,
      },
    });
  });

  afterAll(async () => {
    // Delete in strict foreign key dependency order
    await prisma.custodyLog.deleteMany({
      where: { assetId: testAssetId },
    });
    await prisma.dispatchTicket.deleteMany({
      where: { meetingRoomId: testRoomId },
    });
    await prisma.lockerCompartment.deleteMany({
      where: { lockerId: testLockerId },
    });
    await prisma.smartLocker.deleteMany({
      where: { id: testLockerId },
    });
    await prisma.assetItem.deleteMany({
      where: { id: testAssetId },
    });
    await prisma.hardwareSKU.deleteMany({
      where: { id: testSkuId },
    });
    await prisma.meetingRoom.deleteMany({
      where: { id: testRoomId },
    });
  });

  it(
    "handles 20 concurrent reservation requests for 1 available asset: exactly 1 succeeds, 19 fail with NoStockAvailableError",
    async () => {
      // Fire 20 parallel reservation requests simultaneously
      const workerCount = 20;
      const promises = Array.from({ length: workerCount }).map((_, idx) =>
        reserveEquipment({
          userId: "usr_emp_01",
          meetingRoomId: testRoomId,
          symptomCode: "SYMPTOM_NO_DISPLAY_BYOD",
          preferredSkuId: testSkuId,
          idempotencyKey: `idemp_race_${idx}_${Date.now()}`,
        })
      );

      const results = await Promise.allSettled(promises);

      const fulfilled = results.filter((r) => r.status === "fulfilled");
      const rejected = results.filter((r) => r.status === "rejected");

      for (const r of rejected) {
        if (r.status === "rejected" && !(r.reason instanceof NoStockAvailableError)) {
          console.error("Unexpected rejection reason:", r.reason);
        }
      }

      // ASSERTION 1: Exactly 1 reservation succeeded
      expect(fulfilled.length).toBe(1);

      // ASSERTION 2: Exactly 19 reservations rejected with NoStockAvailableError
      expect(rejected.length).toBe(19);
      for (const r of rejected) {
        if (r.status === "rejected") {
          expect(r.reason).toBeInstanceOf(NoStockAvailableError);
        }
      }

      // ASSERTION 3: In Database, exactly 1 ticket was created
      const tickets = await prisma.dispatchTicket.findMany({
        where: { meetingRoomId: testRoomId },
      });
      expect(tickets.length).toBe(1);
      expect(tickets[0].status).toBe(TicketStatus.OPEN_RESERVED);

      // ASSERTION 4: Compartment is cleanly locked into RESERVED_FOR_PICKUP
      const compartment = await prisma.lockerCompartment.findUnique({
        where: { id: testCompartmentId },
      });
      expect(compartment?.status).toBe(CompartmentStatus.RESERVED_FOR_PICKUP);
      expect(compartment?.activePinHash).toBeDefined();

      // ASSERTION 5: Zero orphaned RESERVED rows
      const orphanedCompartments = await prisma.lockerCompartment.count({
        where: {
          id: testCompartmentId,
          status: CompartmentStatus.STOCKED_AVAILABLE,
        },
      });
      expect(orphanedCompartments).toBe(0);
    },
    25000 // 25s test timeout for 20 parallel workers
  );
});
