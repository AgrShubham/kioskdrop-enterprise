import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  sqlitePragmasInitialized: boolean | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Initializes SQLite pragmas (WAL mode and 10s busy timeout).
 * Note: $queryRawUnsafe must be used because PRAGMA queries return rows (e.g. 'wal').
 */
export async function ensurePragmas(): Promise<void> {
  if (globalForPrisma.sqlitePragmasInitialized) return;
  try {
    await prisma.$queryRawUnsafe("PRAGMA journal_mode = WAL;");
    await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 10000;");
    globalForPrisma.sqlitePragmasInitialized = true;
  } catch (err) {
    // Silently continue if database is not yet ready during initial scaffolding
  }
}

// Call on boot
ensurePragmas();
