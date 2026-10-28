-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "rfidBadgeId" TEXT NOT NULL,
    "biometricTemplateRef" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MeetingRoom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "building" TEXT NOT NULL,
    "displayType" TEXT NOT NULL,
    "roomSystem" TEXT NOT NULL,
    "qrCodeSlug" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TariffRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hsnCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bcdBp" INTEGER NOT NULL,
    "swsBp" INTEGER NOT NULL,
    "igstBp" INTEGER NOT NULL,
    "effectiveFrom" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "HardwareSKU" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "modelNumber" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "wholesalePricePaise" INTEGER NOT NULL,
    "retailPricePaise" INTEGER NOT NULL,
    "reorderThreshold" INTEGER NOT NULL DEFAULT 2,
    "reorderQuantity" INTEGER NOT NULL DEFAULT 5,
    "tariffRateId" TEXT NOT NULL,
    "dpAltMode" BOOLEAN NOT NULL DEFAULT false,
    "powerDeliveryWatts" INTEGER NOT NULL DEFAULT 0,
    "hdcp22Compliant" BOOLEAN NOT NULL DEFAULT false,
    "wirelessBand" TEXT,
    "encryptionSpec" TEXT,
    "wpcEtaCertNumber" TEXT,
    "bisCrsNumber" TEXT,
    CONSTRAINT "HardwareSKU_tariffRateId_fkey" FOREIGN KEY ("tariffRateId") REFERENCES "TariffRate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssetItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "skuId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "usbVendorId" TEXT NOT NULL,
    "usbProductId" TEXT NOT NULL,
    "hidWhitelisted" BOOLEAN NOT NULL DEFAULT true,
    "pkiCertStatus" TEXT NOT NULL DEFAULT 'VALID_SCEP_SIGNED',
    "condition" TEXT NOT NULL DEFAULT 'HEALTHY',
    "availability" TEXT NOT NULL DEFAULT 'IN_LOCKER',
    CONSTRAINT "AssetItem_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "HardwareSKU" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SmartLocker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "locationNote" TEXT NOT NULL,
    "onlineStatus" BOOLEAN NOT NULL DEFAULT true,
    "lastHeartbeatAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "temperatureC" REAL DEFAULT 22.5
);

-- CreateTable
CREATE TABLE "LockerCompartment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lockerId" TEXT NOT NULL,
    "compartmentNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'STOCKED_AVAILABLE',
    "assetId" TEXT,
    "activePinHash" TEXT,
    "solenoidLocked" BOOLEAN NOT NULL DEFAULT true,
    "doorPhysicalOpen" BOOLEAN NOT NULL DEFAULT false,
    "irSensorBreakBeam" BOOLEAN NOT NULL DEFAULT true,
    "chargingConnected" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "LockerCompartment_lockerId_fkey" FOREIGN KEY ("lockerId") REFERENCES "SmartLocker" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LockerCompartment_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "AssetItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DispatchTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itsmExternalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "meetingRoomId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "compartmentId" TEXT NOT NULL,
    "reportedSymptom" TEXT NOT NULL,
    "accessPinHash" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN_RESERVED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "dueAt" DATETIME,
    "dispensedAt" DATETIME,
    "returnedAt" DATETIME,
    CONSTRAINT "DispatchTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DispatchTicket_meetingRoomId_fkey" FOREIGN KEY ("meetingRoomId") REFERENCES "MeetingRoom" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DispatchTicket_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "AssetItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DispatchTicket_compartmentId_fkey" FOREIGN KEY ("compartmentId") REFERENCES "LockerCompartment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustodyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "userId" TEXT,
    "assetId" TEXT,
    "ticketId" TEXT,
    "lockerName" TEXT NOT NULL,
    "compartmentNumber" INTEGER NOT NULL,
    "authMethod" TEXT NOT NULL,
    "details" TEXT,
    "prevHash" TEXT,
    "hash" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustodyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CustodyLog_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "AssetItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poNumber" TEXT NOT NULL,
    "procurementMode" TEXT NOT NULL,
    "vendorName" TEXT NOT NULL,
    "totalAmountPaise" INTEGER NOT NULL,
    "landedDutyPaise" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING_RECEPTION',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PurchaseOrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchaseOrderId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPricePaise" INTEGER NOT NULL,
    CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PurchaseOrderItem_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "HardwareSKU" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FinOpsTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchaseOrderId" TEXT,
    "provider" TEXT NOT NULL,
    "mccCode" TEXT NOT NULL DEFAULT '5045',
    "policyResult" TEXT NOT NULL DEFAULT 'APPROVED',
    "erpSyncTarget" TEXT NOT NULL,
    "erpSyncStatus" TEXT NOT NULL DEFAULT 'SYNCED',
    "vendorName" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "gstInvoiceNumber" TEXT NOT NULL,
    "itemsSummary" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FinOpsTransaction_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "direction" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalEventId" TEXT,
    "payload" TEXT NOT NULL,
    "signatureValid" BOOLEAN NOT NULL DEFAULT true,
    "latencyMs" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "replayOfId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_rfidBadgeId_key" ON "User"("rfidBadgeId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingRoom_qrCodeSlug_key" ON "MeetingRoom"("qrCodeSlug");

-- CreateIndex
CREATE INDEX "MeetingRoom_floor_idx" ON "MeetingRoom"("floor");

-- CreateIndex
CREATE UNIQUE INDEX "TariffRate_hsnCode_key" ON "TariffRate"("hsnCode");

-- CreateIndex
CREATE INDEX "HardwareSKU_category_idx" ON "HardwareSKU"("category");

-- CreateIndex
CREATE INDEX "HardwareSKU_tariffRateId_idx" ON "HardwareSKU"("tariffRateId");

-- CreateIndex
CREATE UNIQUE INDEX "AssetItem_serialNumber_key" ON "AssetItem"("serialNumber");

-- CreateIndex
CREATE INDEX "AssetItem_skuId_idx" ON "AssetItem"("skuId");

-- CreateIndex
CREATE INDEX "AssetItem_availability_idx" ON "AssetItem"("availability");

-- CreateIndex
CREATE INDEX "AssetItem_condition_idx" ON "AssetItem"("condition");

-- CreateIndex
CREATE INDEX "SmartLocker_floor_idx" ON "SmartLocker"("floor");

-- CreateIndex
CREATE UNIQUE INDEX "LockerCompartment_assetId_key" ON "LockerCompartment"("assetId");

-- CreateIndex
CREATE INDEX "LockerCompartment_lockerId_status_idx" ON "LockerCompartment"("lockerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "LockerCompartment_lockerId_compartmentNumber_key" ON "LockerCompartment"("lockerId", "compartmentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DispatchTicket_itsmExternalId_key" ON "DispatchTicket"("itsmExternalId");

-- CreateIndex
CREATE UNIQUE INDEX "DispatchTicket_idempotencyKey_key" ON "DispatchTicket"("idempotencyKey");

-- CreateIndex
CREATE INDEX "DispatchTicket_userId_idx" ON "DispatchTicket"("userId");

-- CreateIndex
CREATE INDEX "DispatchTicket_status_idx" ON "DispatchTicket"("status");

-- CreateIndex
CREATE INDEX "DispatchTicket_meetingRoomId_createdAt_idx" ON "DispatchTicket"("meetingRoomId", "createdAt");

-- CreateIndex
CREATE INDEX "DispatchTicket_expiresAt_idx" ON "DispatchTicket"("expiresAt");

-- CreateIndex
CREATE INDEX "CustodyLog_timestamp_idx" ON "CustodyLog"("timestamp");

-- CreateIndex
CREATE INDEX "CustodyLog_eventType_idx" ON "CustodyLog"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_poNumber_key" ON "PurchaseOrder"("poNumber");

-- CreateIndex
CREATE INDEX "PurchaseOrder_status_idx" ON "PurchaseOrder"("status");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_purchaseOrderId_idx" ON "PurchaseOrderItem"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "FinOpsTransaction_erpSyncStatus_idx" ON "FinOpsTransaction"("erpSyncStatus");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_externalEventId_key" ON "WebhookEvent"("externalEventId");

-- CreateIndex
CREATE INDEX "WebhookEvent_source_createdAt_idx" ON "WebhookEvent"("source", "createdAt");
