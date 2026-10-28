/**
 * Pure Domain State Machine for KioskDrop Enterprise
 * Strictly enforces valid lifecycle transitions for Compartments and Tickets.
 * All transitions are pure functions throwing typed InvalidTransitionError on illegal moves.
 */

export class InvalidTransitionError extends Error {
  constructor(
    public entity: "Compartment" | "Ticket" | "Asset",
    public fromState: string,
    public toState: string,
    public reason?: string
  ) {
    super(
      `Invalid ${entity} transition from '${fromState}' to '${toState}'${
        reason ? `: ${reason}` : ""
      }`
    );
    this.name = "InvalidTransitionError";
  }
}

// ---------------------------------------------------------------------------
// Compartment State Machine
// ---------------------------------------------------------------------------
export const CompartmentStatus = {
  EMPTY: "EMPTY",
  STOCKED_AVAILABLE: "STOCKED_AVAILABLE",
  RESERVED_FOR_PICKUP: "RESERVED_FOR_PICKUP",
  DOOR_OPEN_AWAITING_REMOVAL: "DOOR_OPEN_AWAITING_REMOVAL",
  CHECKED_OUT: "CHECKED_OUT",
  MAINTENANCE_QUARANTINE: "MAINTENANCE_QUARANTINE",
} as const;

export type CompartmentStatusType =
  (typeof CompartmentStatus)[keyof typeof CompartmentStatus];

const VALID_COMPARTMENT_TRANSITIONS: Record<
  CompartmentStatusType,
  CompartmentStatusType[]
> = {
  [CompartmentStatus.EMPTY]: [
    CompartmentStatus.STOCKED_AVAILABLE,
    CompartmentStatus.MAINTENANCE_QUARANTINE,
  ],
  [CompartmentStatus.STOCKED_AVAILABLE]: [
    CompartmentStatus.EMPTY,
    CompartmentStatus.RESERVED_FOR_PICKUP,
    CompartmentStatus.MAINTENANCE_QUARANTINE,
  ],
  [CompartmentStatus.RESERVED_FOR_PICKUP]: [
    CompartmentStatus.DOOR_OPEN_AWAITING_REMOVAL, // On valid PIN/RFID kiosk unlock
    CompartmentStatus.STOCKED_AVAILABLE, // On TTL expiry or cancellation
    CompartmentStatus.MAINTENANCE_QUARANTINE, // On alarm/tamper
  ],
  [CompartmentStatus.DOOR_OPEN_AWAITING_REMOVAL]: [
    CompartmentStatus.CHECKED_OUT, // On IR break-beam device removed
    CompartmentStatus.STOCKED_AVAILABLE, // If user closes door without removing item
    CompartmentStatus.MAINTENANCE_QUARANTINE, // If foreign item or tamper detected
  ],
  [CompartmentStatus.CHECKED_OUT]: [
    CompartmentStatus.STOCKED_AVAILABLE, // On valid return with matching serial & charging check passed
    CompartmentStatus.MAINTENANCE_QUARANTINE, // On charging check failure or return defect
  ],
  [CompartmentStatus.MAINTENANCE_QUARANTINE]: [
    CompartmentStatus.STOCKED_AVAILABLE, // On IT Admin manual clearance/re-stock
    CompartmentStatus.EMPTY, // On IT Admin clearing quarantined item
  ],
};

export function transitionCompartment(
  from: CompartmentStatusType,
  to: CompartmentStatusType,
  reason?: string
): CompartmentStatusType {
  const allowed = VALID_COMPARTMENT_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    throw new InvalidTransitionError("Compartment", from, to, reason);
  }
  return to;
}

// ---------------------------------------------------------------------------
// Ticket State Machine
// ---------------------------------------------------------------------------
export const TicketStatus = {
  OPEN_RESERVED: "OPEN_RESERVED",
  DISPENSED_ACTIVE: "DISPENSED_ACTIVE",
  RETURNED_CLOSED: "RETURNED_CLOSED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
  OVERDUE_ESCALATED: "OVERDUE_ESCALATED",
} as const;

export type TicketStatusType =
  (typeof TicketStatus)[keyof typeof TicketStatus];

const VALID_TICKET_TRANSITIONS: Record<TicketStatusType, TicketStatusType[]> = {
  [TicketStatus.OPEN_RESERVED]: [
    TicketStatus.DISPENSED_ACTIVE, // On kiosk physical item removal
    TicketStatus.EXPIRED, // On TTL lapse
    TicketStatus.CANCELLED, // On user explicit cancel
  ],
  [TicketStatus.DISPENSED_ACTIVE]: [
    TicketStatus.RETURNED_CLOSED, // On hardware returned
    TicketStatus.OVERDUE_ESCALATED, // On exceeding RETURN_DUE_HOURS
  ],
  [TicketStatus.OVERDUE_ESCALATED]: [
    TicketStatus.RETURNED_CLOSED, // Returned after escalation
  ],
  [TicketStatus.RETURNED_CLOSED]: [], // Terminal state
  [TicketStatus.EXPIRED]: [], // Terminal state
  [TicketStatus.CANCELLED]: [], // Terminal state
};

export function transitionTicket(
  from: TicketStatusType,
  to: TicketStatusType,
  reason?: string
): TicketStatusType {
  const allowed = VALID_TICKET_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    throw new InvalidTransitionError("Ticket", from, to, reason);
  }
  return to;
}

// ---------------------------------------------------------------------------
// Asset State & Availability
// ---------------------------------------------------------------------------
export const AssetCondition = {
  HEALTHY: "HEALTHY",
  NEEDS_INSPECTION: "NEEDS_INSPECTION",
  DAMAGED: "DAMAGED",
} as const;

export type AssetConditionType =
  (typeof AssetCondition)[keyof typeof AssetCondition];

export const AssetAvailability = {
  IN_LOCKER: "IN_LOCKER",
  RESERVED: "RESERVED",
  OUT: "OUT",
  QUARANTINED: "QUARANTINED",
} as const;

export type AssetAvailabilityType =
  (typeof AssetAvailability)[keyof typeof AssetAvailability];
