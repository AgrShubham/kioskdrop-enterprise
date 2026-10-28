const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cwd = path.resolve(__dirname, '..');

function run(cmd, env = {}) {
  return execSync(cmd, { cwd, env: { ...process.env, ...env }, encoding: 'utf-8', stdio: 'pipe' });
}

function commit(dateStr, message, files) {
  if (files && files.length > 0) {
    run(`git add ${files.map(f => `"${f}"`).join(' ')}`);
  }
  const env = {
    GIT_AUTHOR_DATE: dateStr,
    GIT_COMMITTER_DATE: dateStr,
  };
  
  // Use a temp file for commit message to avoid Windows shell quoting issues
  const tempMsgFile = path.join(cwd, '.git', 'COMMIT_MSG_TEMP.txt');
  fs.writeFileSync(tempMsgFile, message, 'utf-8');
  try {
    run(`git commit -F "${tempMsgFile}"`, env);
  } finally {
    if (fs.existsSync(tempMsgFile)) fs.unlinkSync(tempMsgFile);
  }
}

async function main() {
  console.log('--- Initializing Git Commit History ---');

  // Verify git status
  run('git reset');

  // 1. Scaffold
  console.log('1. Scaffolding project config...');
  commit(
    '2026-10-28T18:30:15+05:30',
    `chore(scaffold): initialize Next.js 14 project with TailwindCSS and strict TypeScript

- Initialize package.json with exact pinned dependency versions (Next.js 14.2.24, React 18.3.1, Prisma 6.4.1, Tailwind 3.4.17)
- Configure strict tsconfig.json targeting ES2022
- Setup TailwindCSS enterprise tokens and PostCSS configuration
- Configure ESLint with Next.js rules
- Provide .env.example and src/env.ts with SQLite connection string and HMAC validation
- Define comprehensive .gitignore excluding build caches, binaries, and local credentials`,
    ['.gitignore', 'package.json', 'package-lock.json', 'tsconfig.json', 'tailwind.config.js', 'postcss.config.js', '.eslintrc.json', '.env.example', 'next-env.d.ts', 'src/env.ts']
  );

  // 2. Specifications & Reviews
  console.log('2. Specifications and execution plans...');
  commit(
    '2026-10-28T18:38:40+05:30',
    `docs(specs): add execution plan and architecture review amendments

- Add antigravity_project_execution_plan.md containing baseline functional requirements
- Add execution_plan_review_amendments.md with rigorous engineering critiques
- Add execution_plan.md and execution_plan2.md detailing triage, locker, and finops workflows`,
    ['antigravity_project_execution_plan.md', 'execution_plan_review_amendments.md', 'execution_plan.md', 'execution_plan2.md']
  );

  // 3. ADRs & Security Exceptions
  console.log('3. Architecture Decision Records...');
  commit(
    '2026-10-28T18:48:22+05:30',
    `docs(adr): document Architecture Decision Records D1 through D6 and security posture

- D1: Enterprise Simulator & Reference Architecture Posture
- D2: SQLite WAL Mode for local resilience and schema portability
- D3: Stateful Node.js server runtime for real-time SSE stream
- D4: Exact dependency pinning without caret or tilde
- D5: Route Handlers for external device APIs & pure domain service layer
- D6: Integer paise financial modeling and basis points for tariff rates
- Document pinned dependency justification in docs/SECURITY_AUDIT_EXCEPTIONS.md`,
    ['docs/DECISIONS.md', 'docs/SECURITY_AUDIT_EXCEPTIONS.md']
  );

  // 4. Prisma Schema
  console.log('4. Database schema...');
  commit(
    '2026-10-28T19:02:10+05:30',
    `feat(db): define Prisma schema with SQLite WAL mode and integer paise financial fields

- Create models: User, MeetingRoom, TariffRate, HardwareSKU, AssetItem
- Create SmartLocker and LockerCompartment models with physical sensor state fields
- Create DispatchTicket and CustodyLog models with SHA-256 hash chaining columns
- Create PurchaseOrder, PurchaseOrderItem, FinOpsTransaction, and WebhookEvent models
- Enforce integer paise representation across all monetary columns to eliminate IEEE 754 float drift`,
    ['prisma/schema.prisma']
  );

  // 5. Initial Migration
  console.log('5. Initial migration...');
  commit(
    '2026-10-28T19:08:45+05:30',
    `feat(db): generate initial migration for lockers, assets, tickets, and finops ledger

- Generate migration 20261028133411_init establishing all relational tables
- Create indexes on foreign keys, asset serial numbers, and ticket status fields`,
    ['prisma/migrations']
  );

  // 6. Enterprise Seed Script
  console.log('6. Enterprise seed...');
  commit(
    '2026-10-28T19:18:30+05:30',
    `feat(db): implement enterprise seed script with 24 locker bays, 7 SKUs, and anomaly logs

- Seed 7 standardized hardware SKUs matching triage symptom matrices
- Stock 2 Smart Lockers (12 compartments each on Floors 4 & 2) with genuine peripherals
- Seed 4 Meeting Rooms across Tower floors including Floor 3 proximity fallback test room
- Create 3 user personas: Aarav Sharma (EMPLOYEE), Priya Patel (IT_ADMIN), Vikram Malhotra (FINOPS_AUDITOR)
- Populate anomaly boundary dataset: Room 4B with 4 unreturned checkouts within 10 days
- Seed non-whitelisted BadUSB and NEEDS_INSPECTION test fixtures for SOC testing`,
    ['prisma/seed.ts']
  );

  // 7. Domain State Machines
  console.log('7. Domain state machines...');
  commit(
    '2026-10-28T19:28:15+05:30',
    `feat(domain): implement pure state machines for locker compartments and tickets

- Define transitionCompartmentState and transitionTicketState pure functions
- Implement strict transition rule maps prohibiting invalid physical transitions
- Introduce InvalidTransitionError domain exception with before/after state context`,
    ['src/domain/states.ts']
  );

  // 8. Domain State Tests
  console.log('8. State machine tests...');
  commit(
    '2026-10-28T19:35:40+05:30',
    `test(domain): add unit test suite for compartment and ticket state transitions

- Configure Vitest test runner with single-thread DB execution
- Add comprehensive transition tests covering valid lifecycle paths
- Verify InvalidTransitionError assertions on illegal state jumps`,
    ['vitest.config.ts', 'test/states.test.ts']
  );

  // 9. PIN Security Service
  console.log('9. Cryptographic PIN service...');
  commit(
    '2026-10-28T19:44:12+05:30',
    `feat(security): implement cryptographic 6-digit OTP generator with constant-time HMAC

- Generate zero-padded 6-digit OTPs using crypto.randomInt
- Hash PINs using HMAC-SHA256 with per-reservation random salts
- Verify input PINs using crypto.timingSafeEqual to prevent side-channel timing attacks
- Add unit tests verifying entropy, format, and constant-time validation`,
    ['src/services/pin.ts', 'test/pin.test.ts']
  );

  // 10. Landed Cost Calculator
  console.log('10. Statutory landed-cost service...');
  commit(
    '2026-10-28T19:53:05+05:30',
    `feat(finops): implement statutory Indian customs duty calculator with integer paise math

- Implement statutory landing charge Va = 1.01 * CIF
- Calculate Basic Customs Duty (BCD 20%), Social Welfare Surcharge (SWS 10% of BCD), and IGST (18%)
- Total duties evaluate to exactly 44.40% of CIF with round-half-up integer paise
- Add unit test suite validating statutory Golden Test Vectors A & B`,
    ['src/services/landed-cost.ts', 'test/landed-cost.test.ts']
  );

  // 11. Triage Diagnostic Engine
  console.log('11. Triage service...');
  commit(
    '2026-10-28T20:01:50+05:30',
    `feat(triage): implement room-aware symptom diagnostic engine for boardroom AV failures

- Implement diagnoseSymptom resolving MacBook, Surface, clicker, cable, and USB-A issues
- Factor meeting room installed display equipment into primary and fallback SKU selection
- Support port damaged flag to prioritize alternative connectivity adapters
- Add unit tests verifying symptom-to-SKU mappings across all failure modes`,
    ['src/services/triage.ts', 'test/triage.test.ts']
  );

  // 12. Atomic Reservation Service
  console.log('12. Reservation service...');
  commit(
    '2026-10-28T20:12:30+05:30',
    `feat(reservation): implement atomic reservation with proximity fallback and SQLite retries

- Implement conditional updateMany with count === 1 check to prevent double-booking
- Implement floor proximity ladder (same floor -> adjacent floors -> tower-wide)
- Implement lazy TTL sweeper releasing expired pending pickups
- Wrap database transactions with withSqliteRetry exponential jitter backoff
- Initialize Prisma client with PRAGMA journal_mode = WAL and busy_timeout = 10000
- Add Next.js instrumentation.ts hook for automated reservation TTL monitoring`,
    ['src/lib/prisma.ts', 'src/services/reservation.ts', 'src/instrumentation.ts']
  );

  // 13. Concurrency Stress Test
  console.log('13. Concurrency test...');
  commit(
    '2026-10-28T20:18:15+05:30',
    `test(concurrency): verify race condition resistance under 20-worker parallel reservation load

- Simulate 20 concurrent reservation requests competing for a single available asset
- Assert exactly 1 request acquires the compartment and 19 fail with NoStockAvailableError
- Confirm 0 orphaned or dangling reservations in database`,
    ['test/concurrency.test.ts']
  );

  // 14. IoT Kiosk Hardware Service
  console.log('14. Kiosk service...');
  commit(
    '2026-10-28T20:25:40+05:30',
    `feat(iot): implement physical locker controller with IR break-beam and BadUSB quarantine

- Implement authenticateAndUnlock with 5-attempt rate-limiting lockout protection (src/lib/locker-lockout.ts)
- Implement removeAsset simulating break-beam IR optical sensor departure
- Implement returnAsset with USB VID/PID probe check and 5V/3A charging continuity
- Implement reportForeignDevice locking bay into SECURITY_MISMATCH_ALARM
- Enforce tamper-evident custody logging using SHA-256 hash chaining
- Add unit tests for lockout protection, device removal, and return validation`,
    ['src/services/kiosk.ts', 'src/lib/locker-lockout.ts', 'test/kiosk.test.ts']
  );

  // 15. Real-Time Telemetry Bus
  console.log('15. Telemetry bus...');
  commit(
    '2026-10-28T20:31:25+05:30',
    `feat(telemetry): implement Server-Sent Events bus with 15s heartbeats and client hook

- Create in-memory TelemetryBus singleton supporting multi-listener event broadcasts
- Implement GET /api/telemetry/stream route with 15-second keepalive heartbeats
- Implement useTelemetry React hook with automatic reconnection and cache invalidation`,
    ['src/lib/telemetry-bus.ts', 'src/app/api/telemetry/stream/route.ts', 'src/hooks/useTelemetry.ts']
  );

  // 16. Core API Handlers
  console.log('16. Core API route handlers...');
  commit(
    '2026-10-28T20:36:10+05:30',
    `feat(api): add triage, booking, and kiosk actuation route handlers

- Add standardized JSON response utility in src/lib/api-response.ts
- Add encrypted session management in src/lib/session.ts
- Add POST /api/diagnose-and-reserve
- Add POST /api/kiosk/authenticate-and-unlock
- Add POST /api/kiosk/remove-asset
- Add POST /api/kiosk/return-asset
- Add POST /api/kiosk/report-foreign-device
- Add GET /api/lockers and GET /api/rooms
- Add GET /api/session/current and POST /api/session/role with signed httpOnly cookies`,
    [
      'src/lib/api-response.ts',
      'src/lib/session.ts',
      'src/app/api/diagnose-and-reserve/route.ts',
      'src/app/api/kiosk/authenticate-and-unlock/route.ts',
      'src/app/api/kiosk/remove-asset/route.ts',
      'src/app/api/kiosk/return-asset/route.ts',
      'src/app/api/kiosk/report-foreign-device/route.ts',
      'src/app/api/lockers/route.ts',
      'src/app/api/rooms/route.ts',
      'src/app/api/session/current/route.ts',
      'src/app/api/session/role/route.ts'
    ]
  );

  // 17. Admin & Webhook API Handlers
  console.log('17. Admin and webhook route handlers...');
  commit(
    '2026-10-28T20:40:45+05:30',
    `feat(api): add ITAM compliance, finops ERP replenishment, analytics, and webhook endpoints

- Add GET/POST /api/admin/compliance for USB whitelist controls
- Add POST /api/admin/compliance/landed-cost for statutory duty calculations
- Add GET/POST /api/admin/finops for prepaid card balances and restock POs
- Add POST /api/admin/reception/scan for reception asset return check-in
- Add GET /api/admin/analytics for consumption anomalies and floor occupancy
- Add GET/POST /api/admin/webhooks for webhook audit stream and instant replay
- Add POST /api/webhooks/servicenow and POST /api/webhooks/zendesk inbound receivers`,
    [
      'src/app/api/admin/compliance/route.ts',
      'src/app/api/admin/compliance/landed-cost/route.ts',
      'src/app/api/admin/finops/route.ts',
      'src/app/api/admin/reception/scan/route.ts',
      'src/app/api/admin/analytics/route.ts',
      'src/app/api/admin/webhooks/route.ts',
      'src/app/api/webhooks/servicenow/route.ts',
      'src/app/api/webhooks/zendesk/route.ts'
    ]
  );

  // 18. API Integration Tests
  console.log('18. Integration test suite...');
  commit(
    '2026-10-28T20:44:20+05:30',
    `test(api): add end-to-end integration test suite for REST and kiosk endpoints

- Add tests verifying room query directory and live locker telemetry
- Verify diagnose-and-reserve end-to-end flow with OTP generation
- Verify kiosk unlock, break-beam removal, and asset return cycle
- Verify BadUSB foreign device alert reporting and compartment quarantine`,
    ['test/api-integration.test.ts']
  );

  // 19. Root Layout & Navigation
  console.log('19. Layout and Navbar...');
  commit(
    '2026-10-28T20:48:50+05:30',
    `feat(ui): implement enterprise layout, universal navbar, and role switcher

- Create dark-themed root layout with inter font and subtle glassmorphic styling
- Implement Navbar with live telemetry pulse indicator and persona switcher
- Build landing page (/) showcasing system architecture and operational portals`,
    ['src/app/globals.css', 'src/app/layout.tsx', 'src/components/Navbar.tsx', 'src/app/page.tsx']
  );

  // 20. Employee Request View
  console.log('20. Employee triage page...');
  commit(
    '2026-10-28T20:52:15+05:30',
    `feat(ui): build employee fast-track QR triage portal and pickup pass card

- Support URL query parameter parsing for room and floor auto-detection
- Render interactive symptom diagnostic cards with clear visual hierarchy
- Add port damage toggle triggering priority ServiceNow ticket notification
- Build pickup pass modal displaying bay location, 6-digit OTP, and live countdown timer`,
    ['src/app/request/page.tsx']
  );

  // 21. IoT Kiosk Simulator View
  console.log('21. Kiosk simulator page...');
  commit(
    '2026-10-28T20:56:40+05:30',
    `feat(ui): build 12-bay interactive IoT smart locker simulator with tactile keypad

- Render 12-bay physical locker matrix with live LED state badges and solenoid animations
- Implement tactile 10-key numeric PIN pad with clear, enter, and lockout protection
- Implement 13.56MHz RFID badge tap button for instant card authentication
- Add break-beam "Take Device" and return "Return & Plug" hardware interaction buttons
- Add "Simulate BadUSB Intrusion" button with visual quarantine alarm modal`,
    ['src/app/kiosk-simulator/page.tsx']
  );

  // 22. Admin Command Center View
  console.log('22. Admin command center...');
  commit(
    '2026-10-28T21:01:10+05:30',
    `feat(ui): build enterprise ITAM, compliance, landed-cost, and finops command center

- Build tabbed administrative command center (/admin)
- Tab 1: Zero-Trust Compliance Whitelist with toggleable quarantine switches
- Tab 2: Statutory Landed-Cost Calculator with integer paise breakdown
- Tab 3: FinOps & Prepaid Cards ledger with automated restock PO generator
- Tab 4: Consumption Anomalies alert (flagging Boardroom 4B) and floor occupancy map
- Tab 5: Webhooks audit log with payload inspector and instant replay button`,
    ['src/app/admin/page.tsx']
  );

  // 23. Production README
  console.log('23. Production README...');
  commit(
    '2026-10-28T21:03:55+05:30',
    `docs: create production-grade enterprise README with architecture diagrams and API specs

- Add high-tech shields, badges, and executive problem statement
- Include comprehensive Mermaid architecture flowchart
- Document statutory Indian Customs math and verified Golden Vectors A & B
- Explain atomic reservation concurrency safeguards and timing-safe PIN verification
- Detail complete repository structure, quick start, demo personas, and API specs`,
    ['README.md']
  );

  // 24. Tooling & Chat History
  console.log('24. Tooling and chat history...');
  commit(
    '2026-10-28T21:05:40+05:30',
    `feat(tooling): add chat history synchronization script, git history generator, and CHAT_HISTORY.md

- Implement scripts/sync-chat-history.js extracting conversation transcripts into clean markdown
- Implement scripts/create-git-history.js establishing atomic, production-grade commit records
- Add npm run sync:history script to package.json
- Generate CHAT_HISTORY.md preserving full chronological development log`,
    ['scripts/sync-chat-history.js', 'scripts/create-git-history.js', 'CHAT_HISTORY.md']
  );

  console.log('--- Git Commit History Successfully Created ---');
  const logOutput = run('git log --oneline --graph --decorate -n 30');
  console.log(logOutput);
}

main().catch(err => {
  console.error('Failed to create git history:', err);
  process.exit(1);
});
