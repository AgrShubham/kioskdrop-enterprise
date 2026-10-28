import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../src/lib/prisma";
import { reserveEquipment } from "../src/services/reservation";
import {
  authenticateAndUnlock,
  removeAsset,
  returnAsset,
  AuthenticationFailedError,
  SecurityMismatchAlarmError,
} from "../src/services/kiosk";
import { CompartmentStatus, TicketStatus } from "../src/domain/states";

describe("Kiosk Simulator Service & Zero-Trust Return Engine", () => {
  const roomId = "room_boardroom_4b";
  let activeReservation: any;

  beforeAll(async () => {
    // Reserve an equipment unit to test full kiosk lifecycle
    activeReservation = await reserveEquipment({
      userId: "usr_emp_01",
      meetingRoomId: roomId,
      symptomCode: "SYMPTOM_NO_DISPLAY_BYOD",
    });
  });

  afterAll(async () => {
    await prisma.custodyLog.deleteMany();
    await prisma.dispatchTicket.deleteMany();
    await prisma.lockerCompartment.updateMany({
      data: {
        status: CompartmentStatus.STOCKED_AVAILABLE,
        activePinHash: null,
      },
    });
    await prisma.assetItem.updateMany({
      data: {
        availability: "IN_LOCKER",
        condition: "HEALTHY",
      },
    });
  });

  it("fails authentication when wrong PIN is entered", async () => {
    await expect(
      authenticateAndUnlock({
        lockerId: activeReservation.locker.id,
        authMethod: "PIN",
        credentialValue: "999999", // wrong PIN
      })
    ).rejects.toThrow(AuthenticationFailedError);
  });

  it("authenticates and releases solenoid when valid 6-digit PIN is entered", async () => {
    const response = await authenticateAndUnlock({
      lockerId: activeReservation.locker.id,
      authMethod: "PIN",
      credentialValue: activeReservation.accessPin,
    });

    expect(response.success).toBe(true);
    expect(response.solenoidReleased).toBe(true);
    expect(response.unlockedCompartment).toBe(activeReservation.locker.compartmentNumber);

    const comp = await prisma.lockerCompartment.findFirst({
      where: {
        lockerId: activeReservation.locker.id,
        compartmentNumber: activeReservation.locker.compartmentNumber,
      },
    });
    expect(comp?.status).toBe(CompartmentStatus.DOOR_OPEN_AWAITING_REMOVAL);
    expect(comp?.doorPhysicalOpen).toBe(true);
  });

  it("simulates physical removal of device (IR beam break) and activates ticket", async () => {
    const result = await removeAsset(
      activeReservation.locker.id,
      activeReservation.locker.compartmentNumber
    );

    expect(result.success).toBe(true);

    const comp = await prisma.lockerCompartment.findFirst({
      where: {
        lockerId: activeReservation.locker.id,
        compartmentNumber: activeReservation.locker.compartmentNumber,
      },
    });
    expect(comp?.status).toBe(CompartmentStatus.CHECKED_OUT);
    expect(comp?.irSensorBreakBeam).toBe(false);

    const ticket = await prisma.dispatchTicket.findUnique({
      where: { id: activeReservation.ticketId },
    });
    expect(ticket?.status).toBe(TicketStatus.DISPENSED_ACTIVE);
  });

  it("triggers SECURITY_MISMATCH_ALARM when unauthorized foreign device is returned", async () => {
    await expect(
      returnAsset({
        lockerId: activeReservation.locker.id,
        compartmentNumber: activeReservation.locker.compartmentNumber,
        assetSerialNumber: activeReservation.allocatedAsset.serialNumber,
        usbVendorId: "0xDEAD", // Malicious / counterfeit foreign VID
        usbProductId: "0xBEEF", // Counterfeit PID
        chargingConnected: true,
      })
    ).rejects.toThrow(SecurityMismatchAlarmError);

    // Verify bay was quarantined
    const comp = await prisma.lockerCompartment.findFirst({
      where: {
        lockerId: activeReservation.locker.id,
        compartmentNumber: activeReservation.locker.compartmentNumber,
      },
    });
    expect(comp?.status).toBe(CompartmentStatus.MAINTENANCE_QUARANTINE);

    // Ticket must remain OPEN / DISPENSED_ACTIVE
    const ticket = await prisma.dispatchTicket.findUnique({
      where: { id: activeReservation.ticketId },
    });
    expect(ticket?.status).toBe(TicketStatus.DISPENSED_ACTIVE);
  });

  it("accepts return and closes ticket with verified serial and charging continuity", async () => {
    const result = await returnAsset({
      lockerId: activeReservation.locker.id,
      compartmentNumber: activeReservation.locker.compartmentNumber,
      assetSerialNumber: activeReservation.allocatedAsset.serialNumber,
      usbVendorId: activeReservation.allocatedAsset.usbVendorId,
      usbProductId: activeReservation.allocatedAsset.usbProductId,
      chargingConnected: true,
    });

    expect(result.success).toBe(true);
    expect(result.compartmentStatus).toBe(CompartmentStatus.STOCKED_AVAILABLE);

    const ticket = await prisma.dispatchTicket.findUnique({
      where: { id: activeReservation.ticketId },
    });
    expect(ticket?.status).toBe(TicketStatus.RETURNED_CLOSED);

    const comp = await prisma.lockerCompartment.findFirst({
      where: {
        lockerId: activeReservation.locker.id,
        compartmentNumber: activeReservation.locker.compartmentNumber,
      },
    });
    expect(comp?.status).toBe(CompartmentStatus.STOCKED_AVAILABLE);
    expect(comp?.irSensorBreakBeam).toBe(true);
    expect(comp?.chargingConnected).toBe(true);
  });
});
