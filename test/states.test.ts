import { describe, it, expect } from "vitest";
import {
  CompartmentStatus,
  CompartmentStatusType,
  TicketStatus,
  TicketStatusType,
  transitionCompartment,
  transitionTicket,
  InvalidTransitionError,
} from "../src/domain/states";

describe("Domain State Machines", () => {
  describe("Compartment State Transitions", () => {
    it("follows valid reservation -> unlock -> checkout -> return lifecycle", () => {
      let state: CompartmentStatusType = CompartmentStatus.STOCKED_AVAILABLE;

      // 1. Reserved for pickup
      state = transitionCompartment(state, CompartmentStatus.RESERVED_FOR_PICKUP);
      expect(state).toBe(CompartmentStatus.RESERVED_FOR_PICKUP);

      // 2. Door unlocked at kiosk
      state = transitionCompartment(state, CompartmentStatus.DOOR_OPEN_AWAITING_REMOVAL);
      expect(state).toBe(CompartmentStatus.DOOR_OPEN_AWAITING_REMOVAL);

      // 3. Asset removed (IR break-beam)
      state = transitionCompartment(state, CompartmentStatus.CHECKED_OUT);
      expect(state).toBe(CompartmentStatus.CHECKED_OUT);

      // 4. Asset returned and verified
      state = transitionCompartment(state, CompartmentStatus.STOCKED_AVAILABLE);
      expect(state).toBe(CompartmentStatus.STOCKED_AVAILABLE);
    });

    it("allows TTL expiry to return compartment to STOCKED_AVAILABLE", () => {
      const state = transitionCompartment(
        CompartmentStatus.RESERVED_FOR_PICKUP,
        CompartmentStatus.STOCKED_AVAILABLE,
        "TTL expired"
      );
      expect(state).toBe(CompartmentStatus.STOCKED_AVAILABLE);
    });

    it("transitions to MAINTENANCE_QUARANTINE on failure and allows admin clearance", () => {
      const quarantined = transitionCompartment(
        CompartmentStatus.CHECKED_OUT,
        CompartmentStatus.MAINTENANCE_QUARANTINE,
        "Charging cable continuity failed"
      );
      expect(quarantined).toBe(CompartmentStatus.MAINTENANCE_QUARANTINE);

      // Admin clears
      const cleared = transitionCompartment(
        quarantined,
        CompartmentStatus.STOCKED_AVAILABLE,
        "IT technician replaced charging cable and verified bay"
      );
      expect(cleared).toBe(CompartmentStatus.STOCKED_AVAILABLE);
    });

    it("throws InvalidTransitionError on illegal transitions", () => {
      expect(() =>
        transitionCompartment(CompartmentStatus.EMPTY, CompartmentStatus.CHECKED_OUT)
      ).toThrow(InvalidTransitionError);

      expect(() =>
        transitionCompartment(CompartmentStatus.CHECKED_OUT, CompartmentStatus.RESERVED_FOR_PICKUP)
      ).toThrow(InvalidTransitionError);
    });
  });

  describe("Ticket State Transitions", () => {
    it("follows valid reservation -> dispensed -> closed lifecycle", () => {
      let state: TicketStatusType = TicketStatus.OPEN_RESERVED;

      state = transitionTicket(state, TicketStatus.DISPENSED_ACTIVE);
      expect(state).toBe(TicketStatus.DISPENSED_ACTIVE);

      state = transitionTicket(state, TicketStatus.RETURNED_CLOSED);
      expect(state).toBe(TicketStatus.RETURNED_CLOSED);
    });

    it("handles ticket TTL expiration and cancellation from OPEN_RESERVED", () => {
      const expired = transitionTicket(TicketStatus.OPEN_RESERVED, TicketStatus.EXPIRED);
      expect(expired).toBe(TicketStatus.EXPIRED);

      const cancelled = transitionTicket(TicketStatus.OPEN_RESERVED, TicketStatus.CANCELLED);
      expect(cancelled).toBe(TicketStatus.CANCELLED);
    });

    it("handles overdue escalation and post-escalation return", () => {
      let state: TicketStatusType = TicketStatus.DISPENSED_ACTIVE;

      state = transitionTicket(state, TicketStatus.OVERDUE_ESCALATED, "Exceeded 4 hours");
      expect(state).toBe(TicketStatus.OVERDUE_ESCALATED);

      state = transitionTicket(state, TicketStatus.RETURNED_CLOSED, "Returned late");
      expect(state).toBe(TicketStatus.RETURNED_CLOSED);
    });

    it("throws InvalidTransitionError on invalid ticket transitions", () => {
      expect(() =>
        transitionTicket(TicketStatus.RETURNED_CLOSED, TicketStatus.DISPENSED_ACTIVE)
      ).toThrow(InvalidTransitionError);

      expect(() =>
        transitionTicket(TicketStatus.EXPIRED, TicketStatus.DISPENSED_ACTIVE)
      ).toThrow(InvalidTransitionError);
    });
  });
});
