import { describe, it, expect } from "vitest";
import { generateSecurePin, hashPin, verifyPin } from "../src/services/pin";

describe("Cryptographic PIN Service", () => {
  it("generates exactly 6-digit numeric strings with zero padding", () => {
    for (let i = 0; i < 50; i++) {
      const pin = generateSecurePin();
      expect(pin).toMatch(/^\d{6}$/);
      expect(pin.length).toBe(6);
    }
  });

  it("hashes PIN deterministically with server pepper", () => {
    const pin = "048291";
    const pepper = "test-pepper-1234567890";
    const hash1 = hashPin(pin, pepper);
    const hash2 = hashPin(pin, pepper);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 hex length
  });

  it("verifies matching PIN with constant-time equality", () => {
    const pin = "849201";
    const hash = hashPin(pin);

    expect(verifyPin(pin, hash)).toBe(true);
    expect(verifyPin("849202", hash)).toBe(false);
    expect(verifyPin("000000", hash)).toBe(false);
  });

  it("rejects empty or malformed inputs safely", () => {
    expect(verifyPin("", "somehash")).toBe(false);
    expect(verifyPin("123456", "")).toBe(false);
  });
});
