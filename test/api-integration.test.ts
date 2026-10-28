import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../src/lib/prisma";
import { POST as diagnoseAndReserveRoute } from "../src/app/api/diagnose-and-reserve/route";
import { POST as authAndUnlockRoute } from "../src/app/api/kiosk/authenticate-and-unlock/route";
import { POST as removeAssetRoute } from "../src/app/api/kiosk/remove-asset/route";
import { POST as returnAssetRoute } from "../src/app/api/kiosk/return-asset/route";
import { POST as reportForeignDeviceRoute } from "../src/app/api/kiosk/report-foreign-device/route";
import { POST as switchRoleRoute } from "../src/app/api/session/role/route";
import { NextRequest } from "next/server";
import { CompartmentStatus, TicketStatus } from "../src/domain/states";

describe("API Route Handlers Integration Test Suite", () => {
  let createdReservation: any = null;
  const testIdempotencyKey = `idemp_api_test_${Date.now()}`;

  beforeAll(async () => {
    // Ensure clean test baseline
    await prisma.custodyLog.deleteMany();
    await prisma.dispatchTicket.deleteMany();
    await prisma.lockerCompartment.updateMany({
      data: {
        status: CompartmentStatus.STOCKED_AVAILABLE,
        activePinHash: null,
        solenoidLocked: true,
        doorPhysicalOpen: false,
        irSensorBreakBeam: true,
        chargingConnected: true,
      },
    });
  });

  describe("1. POST /api/diagnose-and-reserve", () => {
    it("successfully diagnoses symptom and reserves nearest locker compartment", async () => {
      const req = new NextRequest("http://localhost:3000/api/diagnose-and-reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "idempotency-key": testIdempotencyKey,
        },
        body: JSON.stringify({
          qrCodeSlug: "Boardroom-4B",
          symptomCode: "SYMPTOM_NO_DISPLAY_BYOD",
          portDamaged: false,
        }),
      });

      const res = await diagnoseAndReserveRoute(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.ticketId).toBeDefined();
      expect(json.itsmTicketNumber).toMatch(/^INC00\d{6}$/);
      expect(json.accessPin).toMatch(/^\d{6}$/);
      expect(json.locker.name).toBe("Floor 4 Boardroom Hub");
      expect(json.allocatedAsset.skuName).toContain("USB-C to HDMI");

      createdReservation = json;
    });

    it("returns idempotent response on duplicate request with same idempotency-key", async () => {
      const req = new NextRequest("http://localhost:3000/api/diagnose-and-reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "idempotency-key": testIdempotencyKey,
        },
        body: JSON.stringify({
          qrCodeSlug: "Boardroom-4B",
          symptomCode: "SYMPTOM_NO_DISPLAY_BYOD",
        }),
      });

      const res = await diagnoseAndReserveRoute(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.ticketId).toBe(createdReservation.ticketId);
      expect(json.accessPin).toBe("******"); // Masked on replay
    });

    it("returns 400 validation error on malformed payload", async () => {
      const req = new NextRequest("http://localhost:3000/api/diagnose-and-reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Missing both meetingRoomId and qrCodeSlug
          symptomCode: "SYMPTOM_NO_DISPLAY_BYOD",
        }),
      });

      const res = await diagnoseAndReserveRoute(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("2. POST /api/kiosk/authenticate-and-unlock", () => {
    it("returns 401 when wrong PIN is entered", async () => {
      const req = new NextRequest("http://localhost:3000/api/kiosk/authenticate-and-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lockerId: createdReservation.locker.id,
          authMethod: "PIN",
          credentialValue: "000000", // Wrong PIN
        }),
      });

      const res = await authAndUnlockRoute(req);
      expect(res.status).toBe(401);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.message).toContain("attempt(s) remaining");
    });

    it("successfully unlocks bay and pops solenoid latch with valid PIN", async () => {
      const req = new NextRequest("http://localhost:3000/api/kiosk/authenticate-and-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lockerId: createdReservation.locker.id,
          authMethod: "PIN",
          credentialValue: createdReservation.accessPin,
        }),
      });

      const res = await authAndUnlockRoute(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.solenoidReleased).toBe(true);
      expect(json.unlockedCompartment).toBe(createdReservation.locker.compartmentNumber);
    });
  });

  describe("3. POST /api/kiosk/remove-asset", () => {
    it("simulates physical removal of device (IR beam break)", async () => {
      const req = new NextRequest("http://localhost:3000/api/kiosk/remove-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lockerId: createdReservation.locker.id,
          compartmentNumber: createdReservation.locker.compartmentNumber,
        }),
      });

      const res = await removeAssetRoute(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);

      const comp = await prisma.lockerCompartment.findFirst({
        where: {
          lockerId: createdReservation.locker.id,
          compartmentNumber: createdReservation.locker.compartmentNumber,
        },
      });
      expect(comp?.status).toBe(CompartmentStatus.CHECKED_OUT);
      expect(comp?.irSensorBreakBeam).toBe(false);
    });
  });

  describe("4. POST /api/kiosk/return-asset", () => {
    it("triggers SECURITY_MISMATCH_ALARM and quarantines bay on counterfeit USB return", async () => {
      const req = new NextRequest("http://localhost:3000/api/kiosk/return-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lockerId: createdReservation.locker.id,
          compartmentNumber: createdReservation.locker.compartmentNumber,
          assetSerialNumber: createdReservation.allocatedAsset.serialNumber,
          usbVendorId: "0xBAD1", // Malicious foreign VID
          usbProductId: "0x0001",
          chargingConnected: true,
        }),
      });

      const res = await returnAssetRoute(req);
      expect(res.status).toBe(409);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("SECURITY_MISMATCH_ALARM");
    });

    it("verifies and closes ticket on legitimate hardware return", async () => {
      const req = new NextRequest("http://localhost:3000/api/kiosk/return-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lockerId: createdReservation.locker.id,
          compartmentNumber: createdReservation.locker.compartmentNumber,
          assetSerialNumber: createdReservation.allocatedAsset.serialNumber,
          usbVendorId: createdReservation.allocatedAsset.usbVendorId,
          usbProductId: createdReservation.allocatedAsset.usbProductId,
          chargingConnected: true,
        }),
      });

      const res = await returnAssetRoute(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.ticketClosed).toBe(createdReservation.itsmTicketNumber);
    });
  });

  describe("5. POST /api/kiosk/report-foreign-device", () => {
    it("quarantines bay and generates tamper-evident alarm audit log", async () => {
      const req = new NextRequest("http://localhost:3000/api/kiosk/report-foreign-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lockerId: "lkr_floor2",
          compartmentNumber: 12,
          foreignVendorId: "0x16C0",
          foreignProductId: "0x05DF",
          simulatedAttackVector: "BadUSB Rubber Ducky Keystroke Injection",
        }),
      });

      const res = await reportForeignDeviceRoute(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.alarmTriggered).toBe(true);
      expect(json.compartmentStatus).toBe(CompartmentStatus.MAINTENANCE_QUARANTINE);
    });
  });

  describe("6. POST /api/session/role", () => {
    it("switches persona and returns signed session cookie", async () => {
      const req = new NextRequest("http://localhost:3000/api/session/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "FINOPS_AUDITOR" }),
      });

      const res = await switchRoleRoute(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.session.role).toBe("FINOPS_AUDITOR");
      expect(json.session.name).toBe("Vikram Malhotra");

      const cookie = res.cookies.get("kioskdrop_session");
      expect(cookie).toBeDefined();
      expect(cookie?.value).toContain(".");
    });
  });
});
