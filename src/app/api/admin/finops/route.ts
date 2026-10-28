import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma, ensurePragmas } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { calculateLandedCost } from "@/services/landed-cost";
import { telemetryBus } from "@/lib/telemetry-bus";
import { errorResponse, successResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await ensurePragmas();

  try {
    // Both IT_ADMIN and FINOPS_AUDITOR can view finops ledger
    await requireRole(["IT_ADMIN", "FINOPS_AUDITOR"]);

    const transactions = await prisma.finOpsTransaction.findMany({
      include: {
        purchaseOrder: {
          include: {
            items: {
              include: { sku: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      include: {
        items: {
          include: { sku: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const skus = await prisma.hardwareSKU.findMany({
      include: { tariffRate: true },
    });

    // Compute total savings: difference between retail prices and wholesale prices
    let totalSavingsPaise = 0;
    for (const po of purchaseOrders) {
      for (const item of po.items) {
        const retailUnitPrice = item.sku.retailPricePaise;
        const wholesaleUnitPrice = item.unitPricePaise;
        const savingsPerUnit = retailUnitPrice - wholesaleUnitPrice;
        totalSavingsPaise += savingsPerUnit * item.quantity;
      }
    }

    return successResponse({
      transactions,
      purchaseOrders,
      skus,
      totalSavingsPaise,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

const replenishSchema = z.object({
  skuId: z.string().min(1, "SKU is required"),
  quantity: z.number().int().positive().default(5),
  procurementMode: z.enum(["DIRECT_IMPORT", "DOMESTIC_WHOLESALE"]).default("B2B_WHOLESALE" as any).transform(v => v === "DOMESTIC_WHOLESALE" ? "DOMESTIC_WHOLESALE" : "DIRECT_IMPORT"),
  cardProvider: z.enum(["ZAGGLE_CARD", "HAPPAY_PETTY_CASH"]).default("ZAGGLE_CARD"),
  erpTarget: z.enum(["SAP_S4HANA", "ORACLE_NETSUITE", "ZOHO_BOOKS"]).default("SAP_S4HANA"),
  vendorName: z.string().default("B2B Wholesale AV International"),
});

export async function POST(request: NextRequest) {
  await ensurePragmas();

  try {
    // Only IT_ADMIN can trigger replenishment orders
    await requireRole(["IT_ADMIN"]);

    const body = await request.json();
    const parsed = replenishSchema.parse(body);

    const sku = await prisma.hardwareSKU.findUnique({
      where: { id: parsed.skuId },
      include: { tariffRate: true },
    });

    if (!sku) {
      return errorResponse(new Error("SKU not found"), "SKU_NOT_FOUND", 404);
    }

    const baseAmountPaise = sku.wholesalePricePaise * parsed.quantity;

    // Landed cost calculation
    const dutyBreakdown = calculateLandedCost({
      cifAmountPaise: baseAmountPaise,
      bcdBp: sku.tariffRate.bcdBp,
      swsBp: sku.tariffRate.swsBp,
      igstBp: sku.tariffRate.igstBp,
      procurementMode: parsed.procurementMode,
    });

    const poNumber = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;
    const gstInvoiceNumber = `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`; // Max 16 chars per CGST Rule 46

    // Create PurchaseOrder and linked FinOps Transaction
    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        procurementMode: parsed.procurementMode,
        vendorName: parsed.vendorName,
        totalAmountPaise: dutyBreakdown.totalLandedCostPaise,
        landedDutyPaise: dutyBreakdown.totalDutiesPaise,
        status: "PENDING_RECEPTION",
        items: {
          create: [
            {
              skuId: sku.id,
              quantity: parsed.quantity,
              unitPricePaise: sku.wholesalePricePaise,
            },
          ],
        },
      },
    });

    const txn = await prisma.finOpsTransaction.create({
      data: {
        purchaseOrderId: po.id,
        provider: parsed.cardProvider,
        mccCode: "5045", // Computer Peripherals MCC
        policyResult: "APPROVED",
        erpSyncTarget: parsed.erpTarget,
        erpSyncStatus: "SYNCED",
        vendorName: parsed.vendorName,
        amountPaise: dutyBreakdown.totalLandedCostPaise,
        gstInvoiceNumber,
        itemsSummary: `${parsed.quantity}x ${sku.name}`,
      },
    });

    // Emit SSE event
    telemetryBus.emit("INVENTORY_RESTOCKED", {
      poNumber: po.poNumber,
      skuName: sku.name,
      quantity: parsed.quantity,
      erpTarget: parsed.erpTarget,
    });

    return successResponse({
      purchaseOrder: po,
      transaction: txn,
      dutyBreakdown,
      message: `B2B Purchase Order ${poNumber} generated. Zaggle/Happay transaction reconciled with ${parsed.erpTarget}.`,
    }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
