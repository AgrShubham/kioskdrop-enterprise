# KioskDrop Enterprise: Plan Review & Mandatory Amendments

**Instruction to the implementing agent (Antigravity):** This document amends `execution_plan.md`. Where the two conflict, **this document wins**. Do not start Phase 1 until every item in Section 0 is resolved and recorded in `docs/DECISIONS.md`. Do not move to the next phase until that phase's Definition of Done (Section 10) passes.

---

## 0. Decisions that must be locked first

| # | Decision | Recommendation |
|---|----------|----------------|
| D1 | **Is this a demo/simulation or a real deployment?** The plan is titled "production" but uses SQLite, simulated hardware, mock ITSM/ERP/card integrations, client-supplied `userId`, and role "impersonation". | Build as a **production-quality simulator**: real engineering discipline, but every external system behind an adapter interface with a clearly labelled mock. State this in the README. Never claim "live verification" of WPC/BIS/ServiceNow/SAP/Zaggle. |
| D2 | **Database: SQLite or PostgreSQL.** | Prefer **PostgreSQL** (docker-compose). It gives real enums, `Decimal`, `Json`, partial unique indexes, and row locking, all of which this design needs (see Sections 3, 4, 6). If SQLite stays, accept the workarounds in this document. |
| D3 | **Deployment target.** Not stated anywhere. | **Self-hosted single Node process (`next start`) or Docker.** In-memory SSE pub/sub and SQLite file storage do **not** work on Vercel/serverless or multi-instance. Record this constraint. |
| D4 | **Exact versions.** "Next.js 14+" is not a spec. | Pin exact versions of Next, React, Prisma, Tailwind, Zod, Recharts, Vitest in `package.json` (no `^`). See Section 8. |
| D5 | **Server Actions or Route Handlers** for mutations. The plan uses both without a rule. | Route Handlers for everything in Section 5 (kiosk and webhooks are device/external callers). Server Actions only for admin-UI-only forms. One shared service layer underneath both. |
| D6 | **Money representation.** | Integer **paise** (`Int`/`BigInt`), never `Float`. |

---

## 1. Blocking defects found in the plan (P0)

1. **Duty formula is wrong and the plan contradicts itself three times.**
   - Formula block labels IGST as `22.1796% × V_assess`. That is 22.1796% of **CIF**; of `V_assess` it is 21.96%.
   - Totals quoted: schema default `44.14`, text `≈44.18`, range `44.18–49.15`. Correct total for these rates is **44.40% of CIF**.
   - The API example (`landedDutyINR: 15007.60` on ₹34,000) uses 44.14%. Correct figure is **₹15,095.86** (see Section 2).
2. **No reservation expiry mechanism.** API returns `expiresAt` but `DispatchTicket` has no such column, no TTL value is defined, and no job releases the compartment. Result: compartments stuck in `RESERVED_FOR_PICKUP` forever and `OVERDUE_ESCALATED` is unreachable.
3. **Seed data cannot satisfy the triage matrix.** Matrix needs 7 distinct products (USB-C converter, wireless HDMI kit, HDCP converter, HDMI 2.1 cable, DisplayPort cable, Spotlight clicker, boundary mic kit). Seed defines **4 SKUs**. `SYMPTOM_AV_DESYNC` and `SYMPTOM_AUDIO_ECHO_HOLLOW` will always fail with "no stock".
4. **Locker count contradiction.** Seed: 2 lockers / 16 compartments. Kiosk UI: 12 bays. Rooms are on floors 2, 3, 4,4; "nearest locker on the user's floor" is undefined for floors with no locker.
5. **Race condition on reservation.** Two simultaneous requests can allocate the same asset or compartment. No transaction or conditional update is specified.
6. **Authorization is client-trusted.** `userId` is in the request body, so any caller can act as any user. Role switcher is cosmetic unless enforced server-side. `/admin/*` and `/api/finops/replenish` have no access rules.
7. **Return flow is under-specified and contradicts its own API.** Plan says it verifies VID/PID, but `return-asset` request has no VID/PID fields. No endpoint exists to simulate the foreign-USB alarm. Behaviour when `chargingConnected=false`, wrong compartment, or damaged device is undefined.
8. **Missing data models** for features the modules promise (Section 4).
9. **Prisma/Tailwind/Next version drift will break a fresh install** (Section 8). The schema snippet fails on Prisma 7.
10. **Phase 6 is the only testing phase.** For a "zero bugs" goal, tests must gate every phase.

---

## 2. Landed-cost: corrected specification

Assumed rates (must come from a `TariffRate` table per HSN with `effectiveFrom`, **not hardcoded**; BCD/SWS vary by HSN and change with Union Budgets. Have the finance/customs broker confirm each HSN before use):

- Assessable value `Va = CIF × 1.01`
- `BCD = 20% × Va`
- `SWS = 10% × BCD`
- `IGST = 18% × (Va + BCD + SWS)`

All arithmetic in integer paise. Round **each component half-up to the nearest paisa**, then sum. Never sum then round.

**Test vector A (CIF ₹1,000 = 100000 paise):**

| Component | Paise | ₹ |
|---|---|---|
| Va | 101000 | 1,010.00 |
| BCD | 20200 | 202.00 |
| SWS | 2020 | 20.20 |
| IGST (base 123220) | 22180 | 221.80 |
| **Total duties** | **44400** | **444.00 (44.40% of CIF)** |

**Test vector B (CIF ₹34,000 = 3400000 paise):** Va 3434000; BCD 686800; SWS 68680; IGST 754106; **total 1509586 paise = ₹15,095.86**.

Also required:
- **IGST is recoverable as ITC** for a GST-registered importer. Show two numbers: *landed cost incl. IGST* and *effective cost net of ITC* (`CIF + BCD + SWS`; test vector A: ₹1,222.20).
- **Customs duty applies only to direct imports.** `fulfillmentChannel: B2B_WHOLESALE` from a domestic distributor carries **GST on the invoice, not BCD/SWS/IGST-on-import**. Add a `procurementMode` (`DIRECT_IMPORT` | `DOMESTIC_WHOLESALE`) and compute accordingly.
- Remove the "49.15%" figure and `importDutyPercent` default; derive from `TariffRate`.
- Unit tests must use independently hand-computed fixtures (above), not "statutory rates".
- GST invoice number example `GST-IN-2026-88192` is 17 characters; Rule 46 CGST allows max 16. Generate compliant mock numbers.
- "Live verification of WPC ETA / BIS CRS" is not possible without an official API. Implement **format validation + mock lookup**, labelled as such in the UI.
- "₹1,400 average savings per incident" is a hardcoded, unsourced figure. Compute from `retail premium − wholesale price` data, and label seeded numbers as sample data.

---

## 3. State machines (implement as pure functions with exhaustive tests)

Use string-literal union types plus a Zod enum per field (or real enums on Postgres). One source of truth in `src/domain/states.ts`. Illegal transitions throw a typed `InvalidTransitionError` → HTTP 409.

**Compartment** (rename: `AVAILABLE_OCCUPIED` is ambiguous)
`EMPTY` ⇄ `STOCKED_AVAILABLE` → `RESERVED_FOR_PICKUP` → `DOOR_OPEN_AWAITING_REMOVAL` → `CHECKED_OUT` → (return) `STOCKED_AVAILABLE`
Any → `MAINTENANCE_QUARANTINE` (alarm, damage, failed charge check) → `STOCKED_AVAILABLE` / `EMPTY` via admin action only.
`RESERVED_FOR_PICKUP` → `STOCKED_AVAILABLE` on expiry/cancel.

**Ticket**
`OPEN_RESERVED` → `DISPENSED_ACTIVE` → `RETURNED_CLOSED`
`OPEN_RESERVED` → `EXPIRED` (TTL) / `CANCELLED`
`DISPENSED_ACTIVE` → `OVERDUE_ESCALATED` (after `RETURN_DUE_HOURS`) → `RETURNED_CLOSED`

**Asset** `condition`: `HEALTHY` | `NEEDS_INSPECTION` | `DAMAGED`; add `availability`: `IN_LOCKER` | `RESERVED` | `OUT` | `QUARANTINED`.

**Required rules**
- Reservation TTL = `RESERVATION_TTL_MINUTES` env (default 10). Return due = `RETURN_DUE_HOURS` (default 4).
- Expiry runs **lazily** (checked and applied at the start of every reserve/auth/list call) **and** via a `setInterval` sweeper started once through `instrumentation.ts` (guard against duplicate starts on hot reload).
- Return charging check fails → accept the return, mark asset `NEEDS_INSPECTION`, compartment `MAINTENANCE_QUARANTINE`, close ticket, log event. Do not strand the user.
- Return to wrong compartment or foreign serial → reject, log `SECURITY_MISMATCH_ALARM`, quarantine the bay, emit SSE event, keep ticket open.
- Foreign USB insertion → same alarm path via a new endpoint (Section 5).

---

## 4. Schema amendments

**Add / change**
- `DispatchTicket`: `expiresAt DateTime`, `idempotencyKey String? @unique`, `accessPinHash String` (replace plaintext `accessPin`), `compartmentId String` (explicit link, do not infer via asset), `dueAt DateTime?`.
- `LockerCompartment`: replace `activePin` with `activePinHash String?`; add `@@unique([lockerId, compartmentNumber])`.
- **PIN handling:** store `HMAC-SHA256(PIN, SERVER_PIN_PEPPER)`. Generate with `crypto.randomInt(0, 1_000_000)` zero-padded. Enforce uniqueness among *active* reservations per locker (retry on collision; partial unique index on Postgres). Compare with `crypto.timingSafeEqual`. Show the PIN to the user once.
- `CustodyLog`: make `userId` and `assetId` **nullable** (system events and foreign-USB alarms have neither); add `details Json?` (or `String` on SQLite), `ticketId String?`, and `prevHash`/`hash` columns for tamper-evident chaining. "Immutable" must be enforced: no update/delete code paths, plus a DB trigger/revoke where the DB supports it.
- All money columns → `...Paise Int`. Remove `Float` for money and percentages (use basis points `Int`).
- Add `@@index` on every foreign key and on `(status)`, `(meetingRoomId, createdAt)`, `(timestamp)`. SQLite does not auto-index FKs.
- Set explicit `onDelete` behaviour on every relation (`Restrict` for audit-bearing relations).
- `User`: add `biometricTemplateRef String?` (mock) or remove biometric auth from scope; the plan has no data model for it.
- `SmartLocker`: add `lastHeartbeatAt DateTime?`, `temperatureC Float?` (floor-map telemetry promises both).
- `HardwareSKU`: add `reorderThreshold Int`, `reorderQuantity Int`, `tariffRateId`.
- Seed IDs: the API examples use `usr_emp_01`, `room_boardroom_4b`, `lkr_floor4`, `sku_spotlight_ble`, which are not cuids. Either seed with these fixed IDs or change the contract examples. Pick one.

**New models required by promised features**
- `TariffRate` (hsnCode, bcdBp, swsBp, igstBp, effectiveFrom).
- `WebhookEvent` (direction, source, payload, signatureValid, latencyMs, status, replayOfId, createdAt): needed by the ITSM Webhook Monitor and Replay.
- `StockReceipt` / `PurchaseOrder` (+ lines): replenishment gives only `skuId` and `quantity`, but `AssetItem` requires serial + VID/PID, which only exist at the Reception Inspection step. Replenish creates a PO; reception scan creates `AssetItem`s.
- `Notification`/`EscalationEvent` (optional) for overdue and alarm escalation.
- `FinOpsTransaction`: add `purchaseOrderId`, `mccCode`, `policyResult`.

---

## 5. API contract amendments

**Uniform error envelope (all endpoints):**
```json
{ "success": false, "error": { "code": "NO_STOCK", "message": "...", "details": {} }, "requestId": "..." }
```
Status mapping: `400` validation, `401` unauthenticated, `403` forbidden, `404` not found, `409` conflict/invalid transition/no stock, `410` reservation expired, `423` locker/compartment locked-out, `429` rate limited, `500` unexpected (never leak stack traces).

**Existing endpoints**
- `diagnose-and-reserve`: derive `userId` from the server session (not body). Derive floor from `MeetingRoom` (not from `?floor=`). Accept `Idempotency-Key` header. Resolve room by `qrCodeSlug` (plan uses `Boardroom-4B` in query, `name` in schema). Add `portDamaged: boolean?` (triage rule 1 depends on it). If no locker on the room's floor: define fallback order (adjacent floors by distance) and return the actual locker floor in the response.
- `authenticate-and-unlock`: add per-locker and per-IP attempt limiting (e.g., 5 failures → 15 min lockout, `423`). RFID: badge must match the **ticket's user**, not any employee. Define the biometric credential format (mock) or drop it. Add `requestId` and idempotent re-unlock within the TTL.
- `return-asset`: add `usbVendorId`, `usbProductId`, `condition?`. Reject mismatches per Section 3.
- `replenish`: restrict to `IT_ADMIN`; `FINOPS_AUDITOR` read-only. Add `procurementMode`, `vendorName`. Returns a PO, not instant stock.
- `telemetry/stream`: authenticated; event envelope `{ id, type, version, ts, payload }`; support `Last-Event-ID` replay from a bounded buffer; 15 s heartbeat comments.

**Missing contracts to add**
- `POST /api/kiosk/report-foreign-device` (alarm simulation)
- `POST /api/kiosk/remove-asset` (IR beam break → `CHECKED_OUT`)
- `POST /api/webhooks/servicenow`, `POST /api/webhooks/zendesk` (HMAC signature header, timestamp tolerance, idempotency by external event id)
- `POST /api/admin/webhooks/:id/replay`
- `GET /api/admin/{compliance,finops,analytics}` read endpoints, `POST /api/admin/compliance/landed-cost`
- `POST /api/admin/reception/scan` (creates `AssetItem`)
- `POST /api/session/role` (demo role switch, httpOnly signed cookie; refuse in `NODE_ENV=production` unless `DEMO_MODE=true`)
- Add SSE event types: `ASSET_REMOVED`, `SECURITY_MISMATCH_ALARM`, `TICKET_EXPIRED`, `TICKET_OVERDUE`.

**RBAC matrix** (enforce in **every** handler and service function, not only middleware; Next.js middleware-only auth has had a bypass CVE, CVE-2025-29927, fixed in patched releases):

| Capability | EMPLOYEE | IT_ADMIN | FINOPS_AUDITOR |
|---|---|---|---|
| Reserve / own tickets | yes | yes | no |
| Kiosk simulator | yes | yes | no |
| Compliance registry (write) | no | yes | no |
| Compliance / FinOps (read) | no | yes | yes |
| Replenish | no | yes | no |
| Analytics | no | yes | yes |
| Webhook replay | no | yes | no |

---

## 6. Concurrency & real-time rules

- **Reservation must be one DB transaction** using an atomic conditional claim, e.g. `updateMany({ where: { id, status: 'STOCKED_AVAILABLE' }, data: { status: 'RESERVED_FOR_PICKUP' } })` and check `count === 1`; retry with the next candidate on `0`. On Postgres use `SELECT ... FOR UPDATE SKIP LOCKED`.
- **Mandatory concurrency test:** fire 20 parallel reservations for 1 available asset → exactly 1 succeeds, 19 get `409 NO_STOCK`, zero orphaned `RESERVED` rows.
- **SQLite only:** enable WAL, `busy_timeout`, single writer connection; wrap errors `SQLITE_BUSY` into retries.
- **Prisma client singleton** on `globalThis` (otherwise dev hot-reload exhausts connections/locks).
- **SSE route:** `export const runtime = 'nodejs'`; `export const dynamic = 'force-dynamic'`; headers `Content-Type: text/event-stream`, `Cache-Control: no-cache, no-transform`, `Connection: keep-alive`, `X-Accel-Buffering: no`; remove listener on `request.signal` abort (otherwise listener leak); event bus stored on `globalThis` so route modules share one instance; **emit only after the DB transaction commits**.
- **Drop `BroadcastChannel`** or demote it to an optimization with event-id de-duplication. It only syncs tabs in one browser; the employee phone and kiosk are different devices, so SSE is the real transport. Two sources of truth = duplicate/looping updates.
- On SSE reconnect the client must **refetch authoritative state**, not trust missed events.
- Countdown timers: compute from server `expiresAt` and a server-time offset, not the client clock.

---

## 7. Security & operational requirements

- `.env.example` committed; `src/env.ts` validates all env vars with Zod at boot and fails fast. Secrets: `SERVER_PIN_PEPPER`, `WEBHOOK_SIGNING_SECRET`, `SESSION_SECRET`.
- Rate limiting on reserve, authenticate, webhook endpoints.
- Webhooks: verify HMAC over raw body with `timingSafeEqual`, reject stale timestamps (>5 min), dedupe by event id.
- Security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`), no PII or PINs in logs, structured logging with `requestId`.
- Zod on **every** input, including query params and webhook bodies; `.strict()` objects.
- `npm audit` clean (or documented exceptions) before release.
- Kiosk device identity: kiosk endpoints require a kiosk device token (env/seed) in addition to user credentials, or document that the simulator is trust-all.
- Timezone: store UTC, render in `Asia/Kolkata`; define the 14-day anomaly window boundaries in UTC.

---

## 8. Version and tooling pitfalls (these commonly break AI-generated Next.js projects)

- **Prisma 7** removed `url` from `schema.prisma`, requires `prisma.config.ts`, requires a **driver adapter** (`@prisma/adapter-better-sqlite3` for SQLite), and moves the `prisma-client` generator to an explicit `output`. The plan's schema header will fail on Prisma 7. Either **pin Prisma 6.x** (and keep the plan's header) or update the header, client construction, seed config, and generator output for Prisma 7. Decide once, record it.
- The plan's claim that SQLite "does not support native enums and fails compilation" is outdated: current Prisma docs include guidance for using `enum` on SQLite. Verify against the pinned version; either approach is acceptable, but do not rely on the plan's stated reason.
- "100% schema compatibility with PostgreSQL" is an overclaim (Decimal precision, Json, enums, partial indexes behave differently). Remove it.
- **Next.js 15+**: `params`, `searchParams`, `cookies()`, `headers()` are **async**. Generated code frequently uses them synchronously. Add a lint/typecheck gate.
- Route Handler caching defaults changed in 15+; mark all dynamic handlers `dynamic = 'force-dynamic'`.
- **Tailwind v4** (default in new scaffolds) is CSS-first with `@tailwindcss/postcss`; v3 patterns (`tailwind.config.js`, `@tailwind base`) will not work. Pick one and pin.
- **React Server vs Client:** Recharts, keypad, SSE consumers, and the theme switcher must be `"use client"`.
- **Hydration mismatches:** never render `Date.now()`, random PINs, or locale-formatted times during SSR. Render time-dependent UI client-side after mount. Use `next-themes` with `suppressHydrationWarning` on `<html>`.
- Lint: `next lint` is deprecated/removed in newer Next versions; run `eslint .` directly. Add `tsc --noEmit` (covers tests and seed, which `next build` skips).
- Seed: configure via the mechanism for the pinned Prisma version (`prisma.seed` in `package.json` on v6, `migrations.seed` in `prisma.config.ts` on v7) with `tsx`. Seed must be **idempotent** (upserts or reset-then-seed) and must refuse to run when `NODE_ENV=production` unless forced.
- Audio ("tactile keypad sounds") requires a prior user gesture (browser autoplay policy). Provide a mute toggle and honour `prefers-reduced-motion` for latch animations.
- A real camera QR scanner needs HTTPS and `getUserMedia`. Phase 3 title says "QR Scanner" but the module describes a **simulated** parse. State clearly: simulated, no camera.
- Commit `prisma/migrations/`; use `migrate deploy` in CI/prod, `migrate dev` only locally. Gitignore the `.db` file.

---

## 9. Seed data requirements (replace the Phase 2 list)

- **7+ SKUs** covering every triage target (add DisplayPort cable and boundary mic kit), each with ≥3 serialised assets, plus a few `NEEDS_INSPECTION`, `DAMAGED`, and non-whitelisted assets to exercise filters.
- **Lockers placed so every meeting room's floor has one** (or an explicit fallback case that is tested). Locker bay count = what the kiosk UI renders (12 per locker unless the UI is made dynamic).
- Deterministic IDs per D-section note above.
- Historical data volume sufficient to trigger: a room with **exactly 3** unreturned adapters in 14 days (must NOT flag), a room with **4** (must flag), and one with 4 spread over 15+ days (must NOT flag). The plan's "10 historical logs" cannot exercise the anomaly rule or charts.
- Tariff table rows per HSN with effective dates.
- One expired reservation, one overdue ticket, one quarantined compartment, one webhook event with a bad signature.

---

## 10. Quality gates (Definition of Done per phase)

Every phase ends only when **all** pass: `tsc --noEmit`, `eslint .`, `vitest run`, `next build`, and `npm audit` (no unaddressed high/critical).

| Phase | Additional gate |
|---|---|
| 1 | Fresh clone → `npm ci && migrate && seed && npm run dev` works from README on a clean machine. CI workflow runs all gates. |
| 2 | 100% branch coverage on state machines, PIN service, landed-cost (vectors A and B), triage matrix (every symptom × stock/no-stock). Concurrency test (Section 6) passes. |
| 3 | API integration tests against an isolated test DB (separate `DATABASE_URL`, reset per test file): happy path, expiry, idempotent retry, validation errors, RBAC denial. |
| 4 | Playwright e2e: reserve → PIN unlock → remove → return → ticket closed, plus wrong PIN lockout, foreign device alarm, charging failure, SSE reconnect. Console must have zero errors/warnings. |
| 5 | RBAC e2e for all three personas; webhook HMAC valid/invalid/replayed; replenish → PO → reception scan → stock increment; anomaly boundary cases (3 vs 4, window edges). |
| 6 | Accessibility (axe, keyboard-only through the keypad, `aria-live` for kiosk status), mobile viewport check, Lighthouse run, production build smoke test via `next start`. |

Antigravity's browser subagent verification is useful for visual review but is **not a regression suite**. Playwright specs must be committed so the checks are repeatable.

---

## 11. Smaller inconsistencies to fix

- ServiceNow ID format differs: `INC0049281` (API/schema) vs `INC0089201` (Module 1). Use one generator, one format, collision-safe.
- Spotlight naming differs: "Logitech Spotlight BLE Presentation Remote" (schema) vs "Spotlight Plus BLE Presenter" (Module 1). Use one SKU name.
- Triage rules say "X **or** Y" with no selection logic. Specify priority order and conditions, and use `MeetingRoom.displayType/roomSystem` where relevant (currently unused by triage).
- `preferredSkuId` behaviour is undefined (override? validate it is in the allowed set for the symptom?).
- Module 1 says "nearest locker on the **user's** floor"; it should be the **meeting room's** floor.
- "6-digit OTP **and** NFC/RFID digital badge token" on the pickup pass: define whether the badge token is a separate credential or just the user's `rfidBadgeId`.
- Exec-summary claims ("15-20% of boardrooms fail") are unsourced: do not surface them in the UI as fact.
- `hidWhitelisted` semantics: define what it means for devices (like the Spotlight receiver) that legitimately enumerate as HID.
- Dependency list is absent: list every package with pinned version in the plan.
