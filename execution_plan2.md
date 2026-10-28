# Production Engineering Plan: KioskDrop Enterprise (Amended)
**Enterprise Conference Kit Smart-Locker & Micro-Logistics Platform**

> **Authoritative Specification:** This document incorporates all requirements and corrections from `docs/DECISIONS.md` and `execution_plan_review_amendments.md`.

---

## 1. System Architecture & Decisions Record (ADR Summary)

* **Operational Posture:** Production-quality Enterprise Simulator & Reference Architecture with strict zero-trust cyber validation, high-concurrency database transactions, and high-fidelity mock adapters for third-party integrations (ServiceNow/Zendesk, Zaggle/Happay, SAP/Oracle/Zoho ERP).
* **Database Selection:** SQLite with WAL mode (`PRAGMA journal_mode = WAL;`) and `PRAGMA busy_timeout = 5000;`. Singleton Prisma client, explicit indexes on all relations/status fields, integer paise for all monetary values, and atomic conditional updates via `updateMany` inside transactions.
* **Deployment Target:** Self-hosted single stateful Node.js process (`next start`) or Docker container.
* **Pinned Stack (No carets or tildes):**
  * `next`: `14.2.24`
  * `react`: `18.3.1`
  * `react-dom`: `18.3.1`
  * `@prisma/client`: `6.4.1`
  * `prisma`: `6.4.1`
  * `tailwindcss`: `3.4.17`
  * `lucide-react`: `0.460.0`
  * `zod`: `3.24.2`
  * `recharts`: `2.13.3`
  * `vitest`: `2.1.8`
  * `@playwright/test`: `1.49.1`
  * `typescript`: `5.6.3`
  * `eslint`: `8.57.1`
* **Mutation Patterns:** Route Handlers for external and device-facing APIs; Server Actions only for admin UI forms; unified service layer in `src/services/`.
* **Money & Rate Units:** Integer **paise** (`Int`), basis points (`Int`) for all rates.

---

## 2. Complete Prisma Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                   String           @id @default(cuid())
  name                 String
  email                String           @unique
  department           String
  role                 String           @default("EMPLOYEE") // EMPLOYEE | IT_ADMIN | FINOPS_AUDITOR
  rfidBadgeId          String           @unique
  biometricTemplateRef String?
  tickets              DispatchTicket[]
  custodyLogs          CustodyLog[]
  createdAt            DateTime         @default(now())

  @@index([role])
}

model MeetingRoom {
  id            String           @id @default(cuid())
  name          String           // e.g. "Executive Boardroom 4B"
  floor         Int
  building      String
  displayType   String           // "4K_LED_WALL" | "PROJECTOR_HDMI" | "DUAL_MONITOR"
  roomSystem    String           // "BYOD_LEGACY" | "TEAMS_ROOM" | "ZOOM_ROOM"
  qrCodeSlug    String           @unique
  tickets       DispatchTicket[]

  @@index([floor])
}

model TariffRate {
  id            String        @id @default(cuid())
  hsnCode       String        @unique // e.g. "85437099", "85182210", "85285900"
  description   String
  bcdBp         Int           // Basic Customs Duty in basis points (e.g. 2000 = 20.00%)
  swsBp         Int           // Social Welfare Surcharge in bp (e.g. 200 = 2.00% of CIF)
  igstBp        Int           // IGST in basis points (e.g. 1800 = 18.00%)
  effectiveFrom DateTime      @default(now())
  skus          HardwareSKU[]
}

model HardwareSKU {
  id                  String             @id @default(cuid())
  name                String
  brand               String
  modelNumber         String
  category            String
  wholesalePricePaise Int
  retailPricePaise    Int
  reorderThreshold    Int                @default(2)
  reorderQuantity     Int                @default(5)
  tariffRateId        String
  tariffRate          TariffRate         @relation(fields: [tariffRateId], references: [id])
  
  dpAltMode           Boolean            @default(false)
  powerDeliveryWatts  Int                @default(0)
  hdcp22Compliant     Boolean            @default(false)
  wirelessBand        String?
  encryptionSpec      String?
  
  wpcEtaCertNumber    String?
  bisCrsNumber        String?
  assets              AssetItem[]
  poItems             PurchaseOrderItem[]

  @@index([category])
  @@index([tariffRateId])
}

model AssetItem {
  id                  String             @id @default(cuid())
  skuId               String
  sku                 HardwareSKU        @relation(fields: [skuId], references: [id], onDelete: Restrict)
  serialNumber        String             @unique
  usbVendorId         String
  usbProductId        String
  hidWhitelisted      Boolean            @default(true)
  pkiCertStatus       String             @default("VALID_SCEP_SIGNED")
  condition           String             @default("HEALTHY")
  availability        String             @default("IN_LOCKER") // IN_LOCKER | RESERVED | OUT | QUARANTINED
  compartment         LockerCompartment?
  tickets             DispatchTicket[]
  custodyLogs         CustodyLog[]

  @@index([skuId])
  @@index([availability])
  @@index([condition])
}

model SmartLocker {
  id                  String              @id @default(cuid())
  name                String
  floor               Int
  locationNote        String
  onlineStatus        Boolean             @default(true)
  lastHeartbeatAt     DateTime?           @default(now())
  temperatureC        Float?              @default(22.5)
  compartments        LockerCompartment[]

  @@index([floor])
}

model LockerCompartment {
  id                  String            @id @default(cuid())
  lockerId            String
  locker              SmartLocker       @relation(fields: [lockerId], references: [id], onDelete: Restrict)
  compartmentNumber   Int
  status              String            @default("STOCKED_AVAILABLE")
  assetId             String?           @unique
  asset               AssetItem?        @relation(fields: [assetId], references: [id], onDelete: SetNull)
  activePinHash       String?
  
  solenoidLocked      Boolean           @default(true)
  doorPhysicalOpen    Boolean           @default(false)
  irSensorBreakBeam   Boolean           @default(true)
  chargingConnected   Boolean           @default(true)
  tickets             DispatchTicket[]

  @@unique([lockerId, compartmentNumber])
  @@index([lockerId, status])
}

model DispatchTicket {
  id                  String            @id @default(cuid())
  itsmExternalId      String            @unique
  userId              String
  user                User              @relation(fields: [userId], references: [id], onDelete: Restrict)
  meetingRoomId       String
  meetingRoom         MeetingRoom       @relation(fields: [meetingRoomId], references: [id], onDelete: Restrict)
  assetId             String
  asset               AssetItem         @relation(fields: [assetId], references: [id], onDelete: Restrict)
  compartmentId       String
  compartment         LockerCompartment @relation(fields: [compartmentId], references: [id], onDelete: Restrict)
  reportedSymptom     String
  accessPinHash       String
  idempotencyKey      String?           @unique
  status              String            @default("OPEN_RESERVED")
  createdAt           DateTime          @default(now())
  expiresAt           DateTime
  dueAt               DateTime?
  dispensedAt         DateTime?
  returnedAt          DateTime?

  @@index([userId])
  @@index([status])
  @@index([meetingRoomId, createdAt])
  @@index([expiresAt])
}

model CustodyLog {
  id                  String       @id @default(cuid())
  eventType           String
  userId              String?
  user                User?        @relation(fields: [userId], references: [id], onDelete: Restrict)
  assetId             String?
  asset               AssetItem?   @relation(fields: [assetId], references: [id], onDelete: Restrict)
  ticketId            String?
  lockerName          String
  compartmentNumber   Int
  authMethod          String
  details             String?
  prevHash            String?
  hash                String
  timestamp           DateTime     @default(now())

  @@index([timestamp])
  @@index([eventType])
}

model PurchaseOrder {
  id                  String              @id @default(cuid())
  poNumber            String              @unique
  procurementMode     String              // "DIRECT_IMPORT" | "DOMESTIC_WHOLESALE"
  vendorName          String
  totalAmountPaise    Int
  landedDutyPaise     Int                 @default(0)
  status              String              @default("PENDING_RECEPTION")
  createdAt           DateTime            @default(now())
  items               PurchaseOrderItem[]
  finopsTransactions FinOpsTransaction[]

  @@index([status])
}

model PurchaseOrderItem {
  id                  String        @id @default(cuid())
  purchaseOrderId     String
  purchaseOrder       PurchaseOrder @relation(fields: [purchaseOrderId], references: [id], onDelete: Cascade)
  skuId               String
  sku                 HardwareSKU   @relation(fields: [skuId], references: [id], onDelete: Restrict)
  quantity            Int
  unitPricePaise      Int

  @@index([purchaseOrderId])
}

model FinOpsTransaction {
  id                  String         @id @default(cuid())
  purchaseOrderId     String?
  purchaseOrder       PurchaseOrder? @relation(fields: [purchaseOrderId], references: [id], onDelete: SetNull)
  provider            String         // "ZAGGLE_CARD" | "HAPPAY_PETTY_CASH"
  mccCode             String         @default("5045")
  policyResult        String         @default("APPROVED")
  erpSyncTarget       String         // "SAP_S4HANA" | "ORACLE_NETSUITE" | "ZOHO_BOOKS"
  erpSyncStatus       String         @default("SYNCED")
  vendorName          String
  amountPaise         Int
  gstInvoiceNumber    String
  itemsSummary        String
  createdAt           DateTime       @default(now())

  @@index([erpSyncStatus])
}

model WebhookEvent {
  id                  String        @id @default(cuid())
  direction           String        // "INBOUND" | "OUTBOUND"
  source              String        // "SERVICENOW" | "ZENDESK"
  externalEventId     String?       @unique
  payload             String
  signatureValid      Boolean       @default(true)
  latencyMs           Int           @default(0)
  status              String        // "SUCCESS" | "FAILED" | "REPLAYED"
  replayOfId          String?
  createdAt           DateTime      @default(now())

  @@index([source, createdAt])
}
```

---

## 3. Statutory Landed-Cost Duty Arithmetic

All duty calculations operate strictly in integer paise with round-half-up on every single component before summing:
* $V_a = \text{roundHalfUp}(V_{CIF} \times 1.01)$
* $BCD = \text{roundHalfUp}(V_a \times \frac{bcdBp}{10000})$
* $SWS = \text{roundHalfUp}(BCD \times \frac{swsBp}{10000})$
* $IGST = \text{roundHalfUp}((V_a + BCD + SWS) \times \frac{igstBp}{10000})$
* $\text{Total Landed Duty} = BCD + SWS + IGST$

### Golden Test Vectors
* **Test Vector A (CIF ₹1,000 = 100,000 paise):**
  * $V_a = 101,000$ paise
  * $BCD = 20,200$ paise
  * $SWS = 2,020$ paise
  * $IGST = 22,180$ paise
  * Total Landed Duty = `44400` paise (₹444.00, exactly 44.40% of CIF)
  * Net Cost After ITC = $V_{CIF} + BCD + SWS = 122,220$ paise (₹1,222.20)
* **Test Vector B (CIF ₹34,000 = 3,400,000 paise):**
  * $V_a = 3,434,000$ paise
  * $BCD = 686,800$ paise
  * $SWS = 68,680$ paise
  * $IGST = 754,106$ paise
  * Total Landed Duty = `1509586` paise (₹15,095.86)

---

## 4. Phase-Gated Quality Assurance & Verification

Every phase must pass:
1. `tsc --noEmit`
2. `eslint .`
3. `vitest run`
4. `next build` (when applicable)
5. `npm audit` (zero unaddressed high/critical)

* **Phase 1 Gate:** Clean scaffold, Prisma SQLite migrations, and typecheck pass.
* **Phase 2 Gate:** 100% branch coverage on state machines, landed-cost test vectors A & B, and 20-worker parallel reservation race condition test passing.
* **Phase 3 Gate:** Isolated test DB integration tests (TTL expiry, idempotency, RBAC, SSE streaming).
* **Phase 4 Gate:** Playwright E2E full user flow (QR diagnostic $\rightarrow$ PIN generation $\rightarrow$ Kiosk unlock $\rightarrow$ device removal $\rightarrow$ return).
* **Phase 5 Gate:** Webhook HMAC verification, replay utility, multi-persona RBAC validation, and consumption anomaly detection boundary tests (3 vs 4 unreturned adapters).
* **Phase 6 Gate:** Axe a11y, keyboard navigation, Lighthouse $>90$, production build smoke test with `next start`.
