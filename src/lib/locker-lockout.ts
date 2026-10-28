interface LockoutState {
  failedAttempts: number;
  lockedUntil?: number;
}

const lockoutStore = new Map<string, LockoutState>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export class LockerLockedOutError extends Error {
  constructor(public lockedUntilMs: number) {
    const minutesLeft = Math.ceil((lockedUntilMs - Date.now()) / (60 * 1000));
    super(
      `Locker security lockout active due to 5 consecutive failed attempts. Try again in ${minutesLeft} minute(s).`
    );
    this.name = "LockerLockedOutError";
  }
}

export function checkLockerLockout(lockerId: string): void {
  const state = lockoutStore.get(lockerId);
  if (!state) return;

  if (state.lockedUntil && state.lockedUntil > Date.now()) {
    throw new LockerLockedOutError(state.lockedUntil);
  }

  // Lockout expired, reset attempts
  if (state.lockedUntil && state.lockedUntil <= Date.now()) {
    lockoutStore.delete(lockerId);
  }
}

export function recordFailedAttempt(lockerId: string): number {
  const state = lockoutStore.get(lockerId) || { failedAttempts: 0 };
  state.failedAttempts += 1;

  if (state.failedAttempts >= MAX_ATTEMPTS) {
    state.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    lockoutStore.set(lockerId, state);
    throw new LockerLockedOutError(state.lockedUntil);
  }

  lockoutStore.set(lockerId, state);
  return MAX_ATTEMPTS - state.failedAttempts;
}

export function resetLockerAttempts(lockerId: string): void {
  lockoutStore.delete(lockerId);
}
