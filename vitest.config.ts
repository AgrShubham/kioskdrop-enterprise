import { defineConfig } from "vitest/config";
import path from "path";

// Compute an absolute path to the SQLite DB so Vitest worker processes
// (which may have a different CWD) can always find the file. Using a
// relative path like "file:./prisma/dev.db" resolves against the worker's
// CWD, not the project root, causing SQLITE_CANTOPEN (error code 14).
const TEST_DB = `file:${path.resolve(__dirname, "prisma/dev.db")}`;

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["**/*.test.ts"],
    fileParallelism: false, // Sequential execution prevents SQLite file locks across test suites
    testTimeout: 30000,
    hookTimeout: 30000,
    // Force tests to always use the local SQLite database (ADR D2).
    // This keeps the test suite fast, reliable, and network-free regardless
    // of what DATABASE_URL the .env file contains (e.g. Neon Postgres for production).
    env: {
      DATABASE_URL: TEST_DB,
      DATABASE_URL_UNPOOLED: TEST_DB,
    },
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
