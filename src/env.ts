import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DEMO_MODE: z.string().transform((val) => val === "true" || val === "1"),
  SERVER_PIN_PEPPER: z.string().min(16, "SERVER_PIN_PEPPER must be at least 16 characters"),
  SESSION_SECRET: z.string().min(16, "SESSION_SECRET must be at least 16 characters"),
  WEBHOOK_SIGNING_SECRET: z.string().min(16, "WEBHOOK_SIGNING_SECRET must be at least 16 characters"),
  RESERVATION_TTL_MINUTES: z.string().transform((v) => parseInt(v, 10)).default("10"),
  RETURN_DUE_HOURS: z.string().transform((v) => parseInt(v, 10)).default("4"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  NODE_ENV: process.env.NODE_ENV || "development",
  DEMO_MODE: process.env.DEMO_MODE || "true",
  SERVER_PIN_PEPPER: process.env.SERVER_PIN_PEPPER || "kioskdrop-secret-pepper-2026-production-entropy",
  SESSION_SECRET: process.env.SESSION_SECRET || "kioskdrop-session-secret-key-32charsmin-abc123",
  WEBHOOK_SIGNING_SECRET: process.env.WEBHOOK_SIGNING_SECRET || "kioskdrop-webhook-hmac-sha256-signing-secret",
  RESERVATION_TTL_MINUTES: process.env.RESERVATION_TTL_MINUTES || "10",
  RETURN_DUE_HOURS: process.env.RETURN_DUE_HOURS || "4",
});
