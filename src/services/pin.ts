import crypto from "crypto";

const SERVER_PIN_PEPPER =
  process.env.SERVER_PIN_PEPPER || "kioskdrop-secret-pepper-2026-production-entropy";

/**
 * Generates a cryptographically secure 6-digit numeric OTP (e.g., "048291").
 * Uses crypto.randomInt(0, 1_000_000) with 6-digit zero-padding.
 */
export function generateSecurePin(): string {
  const num = crypto.randomInt(0, 1_000_000);
  return num.toString().padStart(6, "0");
}

/**
 * Hashes a 6-digit PIN using HMAC-SHA256 with the server pepper.
 * Raw plaintext PIN is NEVER stored in the database.
 */
export function hashPin(pin: string, pepper: string = SERVER_PIN_PEPPER): string {
  return crypto.createHmac("sha256", pepper).update(pin).digest("hex");
}

/**
 * Constant-time comparison of a submitted PIN against an HMAC-SHA256 hash.
 * Completely immune to timing-attack side channels.
 */
export function verifyPin(
  submittedPin: string,
  storedHash: string,
  pepper: string = SERVER_PIN_PEPPER
): boolean {
  if (!submittedPin || !storedHash) return false;
  const candidateHash = hashPin(submittedPin, pepper);
  const candidateBuf = Buffer.from(candidateHash, "hex");
  const storedBuf = Buffer.from(storedHash, "hex");

  if (candidateBuf.length !== storedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(candidateBuf, storedBuf);
}
