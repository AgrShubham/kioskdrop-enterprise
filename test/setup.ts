/**
 * Vitest Global Test Setup (ADR D2 — SQLite for tests)
 *
 * This file runs before every test suite. It ensures the Prisma client
 * is configured to use the local SQLite database (file:./prisma/dev.db)
 * regardless of what DATABASE_URL is set in .env (which may point to
 * Neon Postgres for the production deployment).
 *
 * The env override itself is declared in vitest.config.ts → test.env.
 * This setup file flushes the Prisma singleton so it picks up the
 * overridden DATABASE_URL and runs the SQLite WAL pragmas.
 */

import { beforeAll, afterAll } from "vitest";

beforeAll(async () => {
  // Flush the global Prisma singleton so it reconnects with the
  // DATABASE_URL injected by vitest.config.ts (file:./prisma/dev.db).
  const g = globalThis as any;
  if (g.prisma) {
    await g.prisma.$disconnect();
    g.prisma = undefined;
    g.sqlitePragmasInitialized = false;
  }

  // Re-import to establish a fresh SQLite connection with WAL pragmas.
  const { ensurePragmas } = await import("../src/lib/prisma");
  await ensurePragmas();
});

afterAll(async () => {
  const g = globalThis as any;
  if (g.prisma) {
    await g.prisma.$disconnect();
  }
});

