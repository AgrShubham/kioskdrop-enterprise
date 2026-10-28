/**
 * Statutory Indian Landed-Cost & Customs Duty Calculator
 * Strictly calculates duties in integer paise using round-half-up on EACH individual component.
 * Complies with Union Customs Tariff specifications and GST Input Tax Credit (ITC) recovery rules.
 */

export interface LandedCostInput {
  cifAmountPaise: number; // CIF Value in integer paise (e.g. 100000 = ₹1,000.00)
  bcdBp?: number;         // Basic Customs Duty in basis points (default 2000 = 20.00%)
  swsBp?: number;         // Social Welfare Surcharge in bp (default 1000 = 10.00% of BCD)
  igstBp?: number;        // IGST in basis points (default 1800 = 18.00%)
  procurementMode?: "DIRECT_IMPORT" | "DOMESTIC_WHOLESALE";
}

export interface LandedCostBreakdown {
  cifAmountPaise: number;
  assessableValuePaise: number; // Va = CIF * 1.01
  bcdPaise: number;             // Basic Customs Duty
  swsPaise: number;             // Social Welfare Surcharge (10% of BCD)
  igstPaise: number;            // IGST on (Va + BCD + SWS)
  totalDutiesPaise: number;     // BCD + SWS + IGST
  totalLandedCostPaise: number; // CIF + Total Duties
  effectiveCostNetOfItcPaise: number; // CIF + BCD + SWS (IGST recovered as ITC)
  procurementMode: "DIRECT_IMPORT" | "DOMESTIC_WHOLESALE";
  effectiveDutyRatePercent: number; // Total duties / CIF as %
}

/**
 * Standard Round-Half-Up function for integer paise arithmetic.
 * Never sums floats before rounding.
 */
export function roundHalfUp(val: number): number {
  return Math.round(val);
}

export function calculateLandedCost(input: LandedCostInput): LandedCostBreakdown {
  const {
    cifAmountPaise,
    bcdBp = 2000, // 20.00%
    swsBp = 1000, // 10.00% of BCD (= 2.00% of Va)
    igstBp = 1800, // 18.00%
    procurementMode = "DIRECT_IMPORT",
  } = input;

  if (cifAmountPaise < 0) {
    throw new Error("CIF amount cannot be negative");
  }

  if (procurementMode === "DOMESTIC_WHOLESALE") {
    // Domestic procurement from authorized distributor incurs standard GST (18%) on base price, NO customs BCD/SWS.
    const gstPaise = roundHalfUp(cifAmountPaise * (igstBp / 10000));
    return {
      cifAmountPaise,
      assessableValuePaise: cifAmountPaise,
      bcdPaise: 0,
      swsPaise: 0,
      igstPaise: gstPaise,
      totalDutiesPaise: gstPaise,
      totalLandedCostPaise: cifAmountPaise + gstPaise,
      effectiveCostNetOfItcPaise: cifAmountPaise, // Full GST recoverable as ITC
      procurementMode: "DOMESTIC_WHOLESALE",
      effectiveDutyRatePercent: (gstPaise / cifAmountPaise) * 100,
    };
  }

  // DIRECT_IMPORT Statutory Indian Customs Duty Stack:
  // 1. Landing charges assessable base: Va = CIF * 1.01
  const assessableValuePaise = roundHalfUp(cifAmountPaise * 1.01);

  // 2. Basic Customs Duty: BCD = 20% * Va
  const bcdPaise = roundHalfUp(assessableValuePaise * (bcdBp / 10000));

  // 3. Social Welfare Surcharge: SWS = 10% * BCD
  const swsPaise = roundHalfUp(bcdPaise * (swsBp / 10000));

  // 4. IGST base = Va + BCD + SWS
  const igstBasePaise = assessableValuePaise + bcdPaise + swsPaise;
  const igstPaise = roundHalfUp(igstBasePaise * (igstBp / 10000));

  // 5. Total compound duties = BCD + SWS + IGST
  const totalDutiesPaise = bcdPaise + swsPaise + igstPaise;
  const totalLandedCostPaise = cifAmountPaise + totalDutiesPaise;

  // 6. Effective Cost Net of ITC = CIF + BCD + SWS (since IGST is claimable as Input Tax Credit under GST)
  const effectiveCostNetOfItcPaise = cifAmountPaise + bcdPaise + swsPaise;

  const effectiveDutyRatePercent =
    cifAmountPaise > 0 ? (totalDutiesPaise / cifAmountPaise) * 100 : 0;

  return {
    cifAmountPaise,
    assessableValuePaise,
    bcdPaise,
    swsPaise,
    igstPaise,
    totalDutiesPaise,
    totalLandedCostPaise,
    effectiveCostNetOfItcPaise,
    procurementMode: "DIRECT_IMPORT",
    effectiveDutyRatePercent: parseFloat(effectiveDutyRatePercent.toFixed(2)),
  };
}

/**
 * Format integer paise into display INR string (e.g. 100000 -> "₹1,000.00")
 */
export function formatPaiseToINR(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}
