import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

const SERVER_PIN_PEPPER =
  process.env.SERVER_PIN_PEPPER || "kioskdrop-secret-pepper-2026-production-entropy";

function hashPin(pin: string): string {
  return crypto.createHmac("sha256", SERVER_PIN_PEPPER).update(pin).digest("hex");
}

function computeLogHash(
  prevHash: string,
  eventType: string,
  timestamp: string,
  details: string
): string {
  return crypto
    .createHash("sha256")
    .update(`${prevHash}:${eventType}:${timestamp}:${details}`)
    .digest("hex");
}

async function main() {
  console.log("🌱 Starting KioskDrop Enterprise database seed...");

  // 1. Clean existing records in reverse dependency order for idempotency
  await prisma.custodyLog.deleteMany();
  await prisma.dispatchTicket.deleteMany();
  await prisma.lockerCompartment.deleteMany();
  await prisma.smartLocker.deleteMany();
  await prisma.assetItem.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.finOpsTransaction.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.hardwareSKU.deleteMany();
  await prisma.tariffRate.deleteMany();
  await prisma.meetingRoom.deleteMany();
  await prisma.user.deleteMany();
  await prisma.webhookEvent.deleteMany();

  console.log("✓ Existing database records reset.");

  // 2. Seed Users (Pre-configured corporate personas)
  const empUser = await prisma.user.create({
    data: {
      id: "usr_emp_01",
      name: "Aarav Sharma",
      email: "aarav.sharma@enterprise.corp",
      department: "Sales & Strategic Accounts",
      role: "EMPLOYEE",
      rfidBadgeId: "RFID-EMP-8821",
      biometricTemplateRef: "BIO-TMPL-SHA256-AARAV-8821",
    },
  });

  const itUser = await prisma.user.create({
    data: {
      id: "usr_it_02",
      name: "Priya Patel",
      email: "priya.patel@enterprise.corp",
      department: "Enterprise Infrastructure & AV Operations",
      role: "IT_ADMIN",
      rfidBadgeId: "RFID-IT-0042",
      biometricTemplateRef: "BIO-TMPL-SHA256-PRIYA-0042",
    },
  });

  const finUser = await prisma.user.create({
    data: {
      id: "usr_fin_03",
      name: "Vikram Malhotra",
      email: "vikram.malhotra@enterprise.corp",
      department: "Corporate Procurement & FinOps",
      role: "FINOPS_AUDITOR",
      rfidBadgeId: "RFID-FIN-1109",
      biometricTemplateRef: "BIO-TMPL-SHA256-VIKRAM-1109",
    },
  });

  console.log("✓ Corporate personas seeded (Employee, IT Admin, FinOps Auditor).");

  // 3. Seed Meeting Rooms (Floors 2, 3, 4)
  const room4B = await prisma.meetingRoom.create({
    data: {
      id: "room_boardroom_4b",
      name: "Executive Boardroom 4B",
      floor: 4,
      building: "Corporate Tower Alpha",
      displayType: "4K_LED_WALL",
      roomSystem: "BYOD_LEGACY",
      qrCodeSlug: "Boardroom-4B",
    },
  });

  const room4A = await prisma.meetingRoom.create({
    data: {
      id: "room_innovation_4a",
      name: "Innovation Lab 4A",
      floor: 4,
      building: "Corporate Tower Alpha",
      displayType: "DUAL_MONITOR",
      roomSystem: "TEAMS_ROOM",
      qrCodeSlug: "Innovation-Lab-4A",
    },
  });

  const room2A = await prisma.meetingRoom.create({
    data: {
      id: "room_townhall_2a",
      name: "Townhall Auditorium 2A",
      floor: 2,
      building: "Corporate Tower Alpha",
      displayType: "PROJECTOR_HDMI",
      roomSystem: "ZOOM_ROOM",
      qrCodeSlug: "Townhall-2A",
    },
  });

  const room3C = await prisma.meetingRoom.create({
    data: {
      id: "room_pitch_3c",
      name: "Client Pitch Room 3C",
      floor: 3, // Floor 3 has no direct locker -> tests floor distance fallback
      building: "Corporate Tower Alpha",
      displayType: "4K_LED_WALL",
      roomSystem: "BYOD_LEGACY",
      qrCodeSlug: "Client-Pitch-3C",
    },
  });

  console.log("✓ Meeting rooms seeded (including Floor 3 fallback test room).");

  // 4. Seed Tariff Rates
  const tariffElectronics = await prisma.tariffRate.create({
    data: {
      id: "tariff_85437099",
      hsnCode: "85437099",
      description: "Electrical machines and apparatus with individual functions (Presenters, Converters)",
      bcdBp: 2000, // 20.00%
      swsBp: 1000, // 10.00% of BCD
      igstBp: 1800, // 18.00%
    },
  });

  const tariffWirelessAudio = await prisma.tariffRate.create({
    data: {
      id: "tariff_85182210",
      hsnCode: "85182210",
      description: "Multiple loudspeakers and wireless transmitter/receiver kits",
      bcdBp: 2000,
      swsBp: 1000,
      igstBp: 1800,
    },
  });

  const tariffCables = await prisma.tariffRate.create({
    data: {
      id: "tariff_85444299",
      hsnCode: "85444299",
      description: "Insulated cables fitted with connectors (HDMI, DisplayPort)",
      bcdBp: 2000,
      swsBp: 1000,
      igstBp: 1800,
    },
  });

  const tariffMicrophones = await prisma.tariffRate.create({
    data: {
      id: "tariff_85181000",
      hsnCode: "85181000",
      description: "Microphones and stands therefor (Directional Boundary Mics)",
      bcdBp: 2000,
      swsBp: 1000,
      igstBp: 1800,
    },
  });

  // 5. Seed 7+ Standardized SKUs (Exact match for triage matrix)
  const skuUsbc = await prisma.hardwareSKU.create({
    data: {
      id: "sku_usbc_hdmi_60w",
      name: "Multi-Port USB-C to HDMI 4K Converter (DP Alt Mode + 60W PD)",
      brand: "Anker Enterprise",
      modelNumber: "A8338-PRO",
      category: "DISPLAY_CONVERTER",
      wholesalePricePaise: 45000, // ₹450.00
      retailPricePaise: 185000,   // ₹1,850.00
      reorderThreshold: 3,
      reorderQuantity: 6,
      tariffRateId: tariffElectronics.id,
      dpAltMode: true,
      powerDeliveryWatts: 60,
      hdcp22Compliant: true,
    },
  });

  const skuWirelessHdmi = await prisma.hardwareSKU.create({
    data: {
      id: "sku_wireless_hdmi_4k",
      name: "Enterprise 4K Wireless HDMI Transmitter & Receiver Kit",
      brand: "Barco ClickShare Compatible",
      modelNumber: "CS-400W",
      category: "WIRELESS_HDMI_KIT",
      wholesalePricePaise: 1450000, // ₹14,500.00
      retailPricePaise: 2499900,   // ₹24,999.00
      reorderThreshold: 2,
      reorderQuantity: 4,
      tariffRateId: tariffWirelessAudio.id,
      wirelessBand: "5GHz",
      encryptionSpec: "WPA2-Enterprise 802.1X / AES-128",
      wpcEtaCertNumber: "ETA-SD-20240588210",
      bisCrsNumber: "R-41098201",
    },
  });

  const skuHdcpScaler = await prisma.hardwareSKU.create({
    data: {
      id: "sku_hdcp_scaler_4k",
      name: "HDCP 2.2 Compliant 4K Video Scaler & Display Converter",
      brand: "Kramer Electronics",
      modelNumber: "VP-427A",
      category: "DISPLAY_CONVERTER",
      wholesalePricePaise: 380000, // ₹3,800.00
      retailPricePaise: 650000,   // ₹6,500.00
      reorderThreshold: 2,
      reorderQuantity: 4,
      tariffRateId: tariffElectronics.id,
      hdcp22Compliant: true,
    },
  });

  const skuHdmiCable = await prisma.hardwareSKU.create({
    data: {
      id: "sku_hdmi_21_cable",
      name: "Ultra High-Speed HDMI 2.1 Cable (48Gbps, 8K@60Hz, 3m)",
      brand: "Belkin Commercial",
      modelNumber: "AV10175",
      category: "CABLE_HIGH_SPEED",
      wholesalePricePaise: 75000,  // ₹750.00
      retailPricePaise: 249900,   // ₹2,499.00
      reorderThreshold: 4,
      reorderQuantity: 8,
      tariffRateId: tariffCables.id,
    },
  });

  const skuDisplayPort = await prisma.hardwareSKU.create({
    data: {
      id: "sku_dp_14_cable",
      name: "Direct High-Bandwidth DisplayPort 1.4 Cable (32.4Gbps)",
      brand: "Club3D Enterprise",
      modelNumber: "CAC-1060",
      category: "CABLE_HIGH_SPEED",
      wholesalePricePaise: 82000,  // ₹820.00
      retailPricePaise: 289900,   // ₹2,899.00
      reorderThreshold: 3,
      reorderQuantity: 6,
      tariffRateId: tariffCables.id,
    },
  });

  const skuSpotlight = await prisma.hardwareSKU.create({
    data: {
      id: "sku_spotlight_ble",
      name: "Logitech Spotlight BLE Presentation Remote",
      brand: "Logitech",
      modelNumber: "910-004654",
      category: "PRESENTATION_CLICKER",
      wholesalePricePaise: 680000, // ₹6,800.00
      retailPricePaise: 1099500,  // ₹10,995.00
      reorderThreshold: 2,
      reorderQuantity: 5,
      tariffRateId: tariffElectronics.id,
      wirelessBand: "BLE",
      encryptionSpec: "AES-128",
      wpcEtaCertNumber: "ETA-SD-20240211409",
      bisCrsNumber: "R-41092831",
    },
  });

  const skuBoundaryMic = await prisma.hardwareSKU.create({
    data: {
      id: "sku_boundary_mic_kit",
      name: "Directional Boundary Presentation Microphone Kit",
      brand: "Shure Commercial",
      modelNumber: "CVB-B/O",
      category: "AUDIO_MIC_KIT",
      wholesalePricePaise: 420000, // ₹4,200.00
      retailPricePaise: 899000,   // ₹8,990.00
      reorderThreshold: 2,
      reorderQuantity: 4,
      tariffRateId: tariffMicrophones.id,
    },
  });

  console.log("✓ 7 Standardized hardware SKUs seeded.");

  // 6. Seed Smart Lockers (12 bays per locker)
  const locker4 = await prisma.smartLocker.create({
    data: {
      id: "lkr_floor4",
      name: "Floor 4 Boardroom Hub",
      floor: 4,
      locationNote: "East Wing Corridor outside Executive Boardroom 4B",
      onlineStatus: true,
      lastHeartbeatAt: new Date(),
      temperatureC: 22.8,
    },
  });

  const locker2 = await prisma.smartLocker.create({
    data: {
      id: "lkr_floor2",
      name: "Floor 2 Townhall Hub",
      floor: 2,
      locationNote: "Central Foyer outside Townhall Auditorium 2A",
      onlineStatus: true,
      lastHeartbeatAt: new Date(),
      temperatureC: 23.1,
    },
  });

  console.log("✓ Smart lockers initialized on Floor 4 and Floor 2 (12 bays each).");

  // 7. Seed Physical Serialized Assets & Stock Locker Compartments
  // Locker 4 (12 bays):
  // Bays 1-3: USB-C converters
  // Bays 4-5: Wireless HDMI kits
  // Bay 6: HDCP Scaler
  // Bays 7-8: HDMI 2.1 Cables
  // Bay 9: DisplayPort Cable
  // Bays 10-11: Spotlight BLE Remotes
  // Bay 12: Directional Boundary Mic
  const locker4Config = [
    { bay: 1, sku: skuUsbc, vid: "0x291A", pid: "0xA102", sn: "SN-USBC-401" },
    { bay: 2, sku: skuUsbc, vid: "0x291A", pid: "0xA102", sn: "SN-USBC-402" },
    { bay: 3, sku: skuUsbc, vid: "0x291A", pid: "0xA102", sn: "SN-USBC-403" },
    { bay: 4, sku: skuWirelessHdmi, vid: "0x0600", pid: "0x0040", sn: "SN-WHDMI-401" },
    { bay: 5, sku: skuWirelessHdmi, vid: "0x0600", pid: "0x0040", sn: "SN-WHDMI-402" },
    { bay: 6, sku: skuHdcpScaler, vid: "0x0BDA", pid: "0x5411", sn: "SN-HDCP-401" },
    { bay: 7, sku: skuHdmiCable, vid: "0x0000", pid: "0x0000", sn: "SN-HDMI-401" },
    { bay: 8, sku: skuHdmiCable, vid: "0x0000", pid: "0x0000", sn: "SN-HDMI-402" },
    { bay: 9, sku: skuDisplayPort, vid: "0x0000", pid: "0x0000", sn: "SN-DP-401" },
    { bay: 10, sku: skuSpotlight, vid: "0x046D", pid: "0xC53E", sn: "SN-SPOT-401" },
    { bay: 11, sku: skuSpotlight, vid: "0x046D", pid: "0xC53E", sn: "SN-SPOT-402" },
    { bay: 12, sku: skuBoundaryMic, vid: "0x14ED", pid: "0x1012", sn: "SN-MIC-401" },
  ];

  for (const item of locker4Config) {
    const asset = await prisma.assetItem.create({
      data: {
        id: `ast_${item.sn.toLowerCase()}`,
        skuId: item.sku.id,
        serialNumber: item.sn,
        usbVendorId: item.vid,
        usbProductId: item.pid,
        hidWhitelisted: true,
        condition: "HEALTHY",
        availability: "IN_LOCKER",
      },
    });

    await prisma.lockerCompartment.create({
      data: {
        id: `cmpt_lkr4_bay${item.bay}`,
        lockerId: locker4.id,
        compartmentNumber: item.bay,
        status: "STOCKED_AVAILABLE",
        assetId: asset.id,
        solenoidLocked: true,
        doorPhysicalOpen: false,
        irSensorBreakBeam: true,
        chargingConnected: true,
      },
    });
  }

  // Locker 2 (12 bays)
  const locker2Config = [
    { bay: 1, sku: skuUsbc, vid: "0x291A", pid: "0xA102", sn: "SN-USBC-201" },
    { bay: 2, sku: skuUsbc, vid: "0x291A", pid: "0xA102", sn: "SN-USBC-202" },
    { bay: 3, sku: skuWirelessHdmi, vid: "0x0600", pid: "0x0040", sn: "SN-WHDMI-201" },
    { bay: 4, sku: skuWirelessHdmi, vid: "0x0600", pid: "0x0040", sn: "SN-WHDMI-202" },
    { bay: 5, sku: skuHdcpScaler, vid: "0x0BDA", pid: "0x5411", sn: "SN-HDCP-201" },
    { bay: 6, sku: skuHdmiCable, vid: "0x0000", pid: "0x0000", sn: "SN-HDMI-201" },
    { bay: 7, sku: skuHdmiCable, vid: "0x0000", pid: "0x0000", sn: "SN-HDMI-202" },
    { bay: 8, sku: skuDisplayPort, vid: "0x0000", pid: "0x0000", sn: "SN-DP-201" },
    { bay: 9, sku: skuSpotlight, vid: "0x046D", pid: "0xC53E", sn: "SN-SPOT-201" },
    { bay: 10, sku: skuSpotlight, vid: "0x046D", pid: "0xC53E", sn: "SN-SPOT-202" },
    { bay: 11, sku: skuBoundaryMic, vid: "0x14ED", pid: "0x1012", sn: "SN-MIC-201" },
    { bay: 12, sku: skuBoundaryMic, vid: "0x14ED", pid: "0x1012", sn: "SN-MIC-202" },
  ];

  for (const item of locker2Config) {
    const asset = await prisma.assetItem.create({
      data: {
        id: `ast_${item.sn.toLowerCase()}`,
        skuId: item.sku.id,
        serialNumber: item.sn,
        usbVendorId: item.vid,
        usbProductId: item.pid,
        hidWhitelisted: true,
        condition: "HEALTHY",
        availability: "IN_LOCKER",
      },
    });

    await prisma.lockerCompartment.create({
      data: {
        id: `cmpt_lkr2_bay${item.bay}`,
        lockerId: locker2.id,
        compartmentNumber: item.bay,
        status: "STOCKED_AVAILABLE",
        assetId: asset.id,
        solenoidLocked: true,
        doorPhysicalOpen: false,
        irSensorBreakBeam: true,
        chargingConnected: true,
      },
    });
  }

  // Seed intentional test fixtures:
  // 1. One asset flagged NEEDS_INSPECTION
  await prisma.assetItem.create({
    data: {
      id: "ast_damaged_test_01",
      skuId: skuUsbc.id,
      serialNumber: "SN-USBC-DEFECTIVE-99",
      usbVendorId: "0x291A",
      usbProductId: "0xA102",
      hidWhitelisted: true,
      condition: "NEEDS_INSPECTION",
      availability: "QUARANTINED",
    },
  });

  // 2. One asset with BadUSB HID keystroke injection risk (NOT whitelisted)
  await prisma.assetItem.create({
    data: {
      id: "ast_badusb_risk_02",
      skuId: skuUsbc.id,
      serialNumber: "SN-BADUSB-RUBBER-DUCKY-01",
      usbVendorId: "0x16C0", // Generic Non-OEM Vendor ID
      usbProductId: "0x05DF",
      hidWhitelisted: false, // Rejected by Zero-Trust policy
      condition: "HEALTHY",
      availability: "QUARANTINED",
    },
  });

  console.log("✓ 24 Compartments stocked + 2 intentional test filter fixtures.");

  // 8. Seed Anomaly Detection Historical Dataset
  // Anomaly Rule: Room with >= 4 unreturned adapters within 14 days is FLAGGED.
  // Case A: Room 4B has 4 unreturned checkouts in the past 10 days -> MUST FLAG
  // Case B: Room 2A has exactly 3 unreturned checkouts in the past 10 days -> MUST NOT FLAG
  // Case C: Room 3C has 4 unreturned checkouts spread over 16 days -> MUST NOT FLAG
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  // Case A: Room 4B (4 unreturned within 10 days) -> FLAGGED
  for (let i = 1; i <= 4; i++) {
    const historicalAsset = await prisma.assetItem.create({
      data: {
        id: `ast_hist_4b_${i}`,
        skuId: skuUsbc.id,
        serialNumber: `SN-HIST-4B-00${i}`,
        usbVendorId: "0x291A",
        usbProductId: "0xA102",
        condition: "HEALTHY",
        availability: "OUT",
      },
    });

    const ticketDate = new Date(now.getTime() - i * 2 * dayMs);
    await prisma.dispatchTicket.create({
      data: {
        id: `tkt_hist_4b_${i}`,
        itsmExternalId: `INC004100${i}`,
        userId: empUser.id,
        meetingRoomId: room4B.id,
        assetId: historicalAsset.id,
        compartmentId: "cmpt_lkr4_bay1",
        reportedSymptom: "SYMPTOM_NO_DISPLAY_BYOD",
        accessPinHash: hashPin("123456"),
        status: "DISPENSED_ACTIVE", // Not returned!
        createdAt: ticketDate,
        expiresAt: new Date(ticketDate.getTime() + 10 * 60 * 1000),
        dispensedAt: new Date(ticketDate.getTime() + 3 * 60 * 1000),
      },
    });
  }

  // Case B: Room 2A (exactly 3 unreturned within 10 days) -> NOT FLAGGED
  for (let i = 1; i <= 3; i++) {
    const historicalAsset = await prisma.assetItem.create({
      data: {
        id: `ast_hist_2a_${i}`,
        skuId: skuUsbc.id,
        serialNumber: `SN-HIST-2A-00${i}`,
        usbVendorId: "0x291A",
        usbProductId: "0xA102",
        condition: "HEALTHY",
        availability: "OUT",
      },
    });

    const ticketDate = new Date(now.getTime() - i * 3 * dayMs);
    await prisma.dispatchTicket.create({
      data: {
        id: `tkt_hist_2a_${i}`,
        itsmExternalId: `INC004200${i}`,
        userId: empUser.id,
        meetingRoomId: room2A.id,
        assetId: historicalAsset.id,
        compartmentId: "cmpt_lkr2_bay1",
        reportedSymptom: "SYMPTOM_NO_DISPLAY_BYOD",
        accessPinHash: hashPin("123456"),
        status: "DISPENSED_ACTIVE",
        createdAt: ticketDate,
        expiresAt: new Date(ticketDate.getTime() + 10 * 60 * 1000),
        dispensedAt: new Date(ticketDate.getTime() + 3 * 60 * 1000),
      },
    });
  }

  // Case C: Room 3C (4 unreturned, but dates are 15, 18, 21, 24 days ago) -> NOT FLAGGED
  for (let i = 1; i <= 4; i++) {
    const historicalAsset = await prisma.assetItem.create({
      data: {
        id: `ast_hist_3c_${i}`,
        skuId: skuUsbc.id,
        serialNumber: `SN-HIST-3C-00${i}`,
        usbVendorId: "0x291A",
        usbProductId: "0xA102",
        condition: "HEALTHY",
        availability: "OUT",
      },
    });

    const ticketDate = new Date(now.getTime() - (14 + i * 3) * dayMs);
    await prisma.dispatchTicket.create({
      data: {
        id: `tkt_hist_3c_${i}`,
        itsmExternalId: `INC004300${i}`,
        userId: empUser.id,
        meetingRoomId: room3C.id,
        assetId: historicalAsset.id,
        compartmentId: "cmpt_lkr4_bay1",
        reportedSymptom: "SYMPTOM_NO_DISPLAY_BYOD",
        accessPinHash: hashPin("123456"),
        status: "DISPENSED_ACTIVE",
        createdAt: ticketDate,
        expiresAt: new Date(ticketDate.getTime() + 10 * 60 * 1000),
        dispensedAt: new Date(ticketDate.getTime() + 3 * 60 * 1000),
      },
    });
  }

  console.log("✓ Anomaly boundary test dataset seeded (4B=Flagged, 2A=Unflagged, 3C=Unflagged).");

  // 9. Seed FinOps Transactions & Purchase Orders
  const po1 = await prisma.purchaseOrder.create({
    data: {
      id: "po_2026_001",
      poNumber: "PO-2026-001",
      procurementMode: "DIRECT_IMPORT",
      vendorName: "B2B Wholesale AV International",
      totalAmountPaise: 3400000, // ₹34,000.00
      landedDutyPaise: 1509586,  // ₹15,095.86 (satisfies Test Vector B)
      status: "INSPECTED_STOCKED",
      items: {
        create: [
          {
            skuId: skuWirelessHdmi.id,
            quantity: 2,
            unitPricePaise: 1450000,
          },
          {
            skuId: skuUsbc.id,
            quantity: 11,
            unitPricePaise: 45000,
          },
        ],
      },
    },
  });

  await prisma.finOpsTransaction.create({
    data: {
      id: "txn_zaggle_001",
      purchaseOrderId: po1.id,
      provider: "ZAGGLE_CARD",
      mccCode: "5045",
      policyResult: "APPROVED",
      erpSyncTarget: "SAP_S4HANA",
      erpSyncStatus: "SYNCED",
      vendorName: "B2B Wholesale AV International",
      amountPaise: 3400000,
      gstInvoiceNumber: "INV-2026-09812", // 14 chars, compliant with CGST Rule 46 (max 16)
      itemsSummary: "2x Wireless HDMI Kit + 11x USB-C Converter",
    },
  });

  await prisma.finOpsTransaction.create({
    data: {
      id: "txn_happay_002",
      provider: "HAPPAY_PETTY_CASH",
      mccCode: "5045",
      policyResult: "APPROVED",
      erpSyncTarget: "ZOHO_BOOKS",
      erpSyncStatus: "SYNCED",
      vendorName: "DarkStore Emergency AV Restock",
      amountPaise: 750000, // ₹7,500.00
      gstInvoiceNumber: "INV-2026-11045",
      itemsSummary: "10x High-Speed HDMI 2.1 Cables",
    },
  });

  // 10. Seed Tamper-Evident Chain of Custody Initial Blocks
  let prevHash = "0000000000000000000000000000000000000000000000000000000000000000"; // Genesis hash

  const genesisLogTimestamp = new Date(now.getTime() - 2 * dayMs).toISOString();
  const genesisHash = computeLogHash(
    prevHash,
    "SYSTEM_INIT",
    genesisLogTimestamp,
    "Genesis custody block initialized"
  );

  await prisma.custodyLog.create({
    data: {
      id: "log_genesis_001",
      eventType: "SYSTEM_INIT",
      userId: itUser.id,
      lockerName: "Floor 4 Boardroom Hub",
      compartmentNumber: 1,
      authMethod: "SYSTEM",
      details: JSON.stringify({ note: "Initial system commissioning & lock test" }),
      prevHash: prevHash,
      hash: genesisHash,
      timestamp: new Date(genesisLogTimestamp),
    },
  });

  // 11. Seed Webhook Audit Events
  await prisma.webhookEvent.create({
    data: {
      id: "wh_sn_001",
      direction: "OUTBOUND",
      source: "SERVICENOW",
      externalEventId: "SN-EVT-99812",
      payload: JSON.stringify({
        incident_id: "INC0049281",
        short_description: "AV Equipment Dispatched to Executive Boardroom 4B",
        urgency: "1",
        state: "In Progress",
      }),
      signatureValid: true,
      latencyMs: 142,
      status: "SUCCESS",
    },
  });

  await prisma.webhookEvent.create({
    data: {
      id: "wh_zd_002",
      direction: "INBOUND",
      source: "ZENDESK",
      externalEventId: "ZD-TKT-44910",
      payload: JSON.stringify({
        ticket_id: "44910",
        requester: "aarav.sharma@enterprise.corp",
        status: "open",
      }),
      signatureValid: true,
      latencyMs: 88,
      status: "SUCCESS",
    },
  });

  console.log("✨ Seed script completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
