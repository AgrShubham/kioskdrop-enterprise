import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma, ensurePragmas } from "@/lib/prisma";
import { calculateLandedCost, formatPaiseToINR } from "@/services/landed-cost";
import { errorResponse, successResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const landedCostSchema = z.object({
  cifAmountINR: z.number().positive(),
  hsnCode: z.string().default("85437099"),
  procurementMode: z.enum(["DIRECT_IMPORT", "DOMESTIC_WHOLESALE"]).default("DIRECT_IMPORT"),
});

export async function POST(request: NextRequest) {
  await ensurePragmas();

  try {
    const body = await request.json();
    const { cifAmountINR, hsnCode, procurementMode } = landedCostSchema.parse(body);

    // Look up statutory tariff rates for this HSN
    const tariff = await prisma.tariffRate.findUnique({
      where: { hsnCode },
    });

    const bcdBp = tariff ? tariff.bcdBp : 2000;
    const swsBp = tariff ? tariff.swsBp : 1000;
    const igstBp = tariff ? tariff.igstBp : 1800;

    const cifAmountPaise = Math.round(cifAmountINR * 100);

    const breakdown = calculateLandedCost({
      cifAmountPaise,
      bcdBp,
      swsBp,
      igstBp,
      procurementMode,
    });

    return successResponse({
      ...breakdown,
      formatted: {
        cifINR: formatPaiseToINR(breakdown.cifAmountPaise),
        assessableValueINR: formatPaiseToINR(breakdown.assessableValuePaise),
        bcdINR: formatPaiseToINR(breakdown.bcdPaise),
        swsINR: formatPaiseToINR(breakdown.swsPaise),
        igstINR: formatPaiseToINR(breakdown.igstPaise),
        totalDutiesINR: formatPaiseToINR(breakdown.totalDutiesPaise),
        totalLandedCostINR: formatPaiseToINR(breakdown.totalLandedCostPaise),
        netCostAfterItcINR: formatPaiseToINR(breakdown.effectiveCostNetOfItcPaise),
      },
      rates: {
        bcdPercent: `${bcdBp / 100}%`,
        swsPercent: `${swsBp / 100}% of BCD`,
        igstPercent: `${igstBp / 100}%`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
