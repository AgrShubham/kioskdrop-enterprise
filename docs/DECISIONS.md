# Architecture Decision Records (ADRs) - KioskDrop Enterprise

This document formally records all architectural decisions (Section 0 of `execution_plan_review_amendments.md`) locked prior to implementation.

---

## D1: Simulation Scope & Production Posture
* **Status:** LOCKED
* **Decision:** Build as a **Production-Quality Enterprise Simulator & Reference Architecture**.
* **Rationale:** The application demonstrates real engineering discipline, robust state machines, strict zero-trust cyber validation, real-time telemetry, and resilient database concurrency. However, enterprise external dependencies (ServiceNow/Zendesk webhooks, Zaggle/Happay prepaid cards, SAP/Oracle/Zoho ERP, WPC/BIS regulatory portals) are accessed through clean adapter interfaces with clearly labeled, verifiable mocks.
* **Requirements:**
  * The `README.md` must clearly state that external integrations operate via high-fidelity mock adapters.
  * Never claim "live external verification" with real government/third-party portals.
  * All mock responses must adhere strictly to authentic API schemas (e.g. ServiceNow sys_id, Zaggle transaction logs, GST CGST Rule 46 invoice length).

---

## D2: Database Selection & Concurrency Model
* **Status:** LOCKED
* **Decision:** **SQLite with WAL mode, single writer connection pool, and atomic conditional updates via Prisma ORM**.
* **Rationale:** Docker CLI is installed on this system, but the Docker Desktop daemon is inactive. Mandating PostgreSQL would break out-of-the-box developer experience. SQLite provides zero-dependency execution across any Windows/macOS/Linux machine.
* **Strict Workarounds Implemented for SQLite Parity:**
  * SQLite WAL mode (`PRAGMA journal_mode = WAL;`) and `PRAGMA busy_timeout = 5000;` enabled on client connection.
  * Prisma client configured as a singleton on `globalThis` to prevent connection exhaustion during Next.js hot reload.
  * Monetary values stored strictly as integer **paise** (`Int`), not `Float`.
  * Tax and duty rates stored as basis points (`Int`, 100 bp = 1.00%).
  * State enums defined as typed TypeScript string-literal unions with Zod validation at runtime.
  * Concurrency and race conditions prevented using atomic conditional updates (`updateMany` with `where: { id, status: 'STOCKED_AVAILABLE' }` asserting `count === 1`) inside Prisma transactions.
  * Explicit `@@index` added to all foreign keys and frequently queried status/timestamp columns (SQLite does not automatically index foreign keys).

---

## D3: Deployment Target & Runtime Environment
* **Status:** LOCKED
* **Decision:** **Self-hosted single stateful Node.js process (`next start`) or Docker container**.
* **Rationale:** In-memory Server-Sent Events (SSE) pub/sub event bus, cross-tab telemetry streaming, and in-process background reservation TTL sweepers require a persistent Node.js runtime. Serverless / edge runtimes (e.g., standard Vercel serverless) do not maintain persistent in-memory listeners or shared state without external pub/sub infrastructure (like Redis/Kafka).
* **Requirements:**
  * Document runtime requirements in `README.md`.
  * Declare `export const runtime = 'nodejs'` and `export const dynamic = 'force-dynamic'` on all dynamic API Route Handlers.

---

## D4: Exact Dependency Version Pinning
* **Status:** LOCKED
* **Decision:** Pin exact dependency versions in `package.json` with **no caret (`^`) or tilde (`~`) prefixes**.
* **Pinned Stack:**
  * `next`: `14.2.24` (Avoids Next.js 15 breaking changes where `headers()`, `cookies()`, and route `params` are asynchronous; provides rock-solid Route Handlers and Server Actions).
  * `react`: `18.3.1`
  * `react-dom`: `18.3.1`
  * `@prisma/client`: `6.4.1`
  * `prisma`: `6.4.1` (Avoids Prisma 7 configuration breaking changes that mandate external driver adapters like `@prisma/adapter-better-sqlite3` and removes `url` from `schema.prisma`).
  * `tailwindcss`: `3.4.17` (Avoids Tailwind v4 PostCSS breaking changes).
  * `lucide-react`: `0.460.0`
  * `zod`: `3.24.2`
  * `recharts`: `2.13.3`
  * `vitest`: `2.1.8`
  * `@playwright/test`: `1.49.1`
  * `typescript`: `5.6.3`
  * `eslint`: `8.57.1`

---

## D5: Mutation Architecture & Service Layer
* **Status:** LOCKED
* **Decision:** **Route Handlers** for all external/device-facing operations; **Server Actions** only for internal admin-UI forms; both call a shared domain service layer.
* **Structure:**
  * Device & external callers (Kiosk simulator, QR mobile diagnosis, webhook receivers, SSE stream) use `src/app/api/.../route.ts`.
  * All domain logic (triage rules, state machine transitions, landed-cost calculations, PIN hashing, reservation lifecycle) lives in `src/services/` and `src/domain/`.
  * UI mutations invoke the same service functions.

---

## D6: Money Representation & Statutory Units
* **Status:** LOCKED
* **Decision:**
  * All money values in the database, API payloads, and calculation engines are stored and manipulated as **integer paise** (`Int` or `BigInt`), NEVER `Float`.
  * 1 Rupee = 100 paise (e.g. ₹1,000.00 is stored as `100000`).
  * All tax rates, customs duties, and tariff percentages are stored as **basis points** (`Int`, where 2000 bp = 20.00%, 1800 bp = 18.00%, 1000 bp = 10.00%).
  * Landed-cost calculation applies round-half-up to the nearest paisa on **each individual component** before summing.
