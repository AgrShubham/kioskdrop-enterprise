import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma, ensurePragmas } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { calculateLandedCost } from "@/services/landed-cost";
import { errorResponse, successResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await ensurePragmas();

  try {
    // Both IT_ADMIN and FINOPS_AUDITOR can read compliance
    await requireRole(["IT_ADMIN", "FINOPS_AUDITOR"]);

    const assets = await prisma.assetItem.findMany({
      include: {
        sku: {
          include: { tariffRate: true },
        },
        compartment: {
          include: { locker: true },
        },
      },
      orderBy: { serialNumber: "asc" },
    });

    const tariffRates = await prisma.tariffRate.findMany({
      include: {
        skus: true,
      },
    });

    return successResponse({
      assets,
      tariffRates,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

const updateWhitelistSchema = z.object({
  assetId: z.string(),
  hidWhitelisted: z.boolean(),
});

export async function POST(request: NextRequest) {
  await ensurePragmas();

  try {
    // Only IT_ADMIN can modify compliance whitelist
    await requireRole(["IT_ADMIN"]);

    const body = await request.json();
    const { assetId, hidWhitelisted } = updateWhitelistSchema.parse(body);

    const updated = await prisma.assetItem.update({
      where: { id: assetId },
      data: { hidWhitelisted },
    });

    return successResponse({
      updated,
      message: `Asset ${updated.serialNumber} whitelist status updated to ${hidWhitelisted}.`,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
