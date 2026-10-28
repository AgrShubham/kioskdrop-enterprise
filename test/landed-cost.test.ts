import { describe, it, expect } from "vitest";
import { calculateLandedCost, formatPaiseToINR } from "../src/services/landed-cost";

describe("Statutory Indian Landed-Cost Calculator", () => {
  it("satisfies Golden Test Vector A: CIF ₹1,000.00 (100,000 paise)", () => {
    // Test Vector A from Section 2 of execution_plan_review_amendments.md:
    // CIF: 100,000 paise (₹1,000.00)
    // Va: 101,000 paise (₹1,010.00)
    // BCD: 20,200 paise (₹202.00)
    // SWS: 2,020 paise (₹20.20)
    // IGST: 22,180 paise (₹221.80)
    // Total duties: 44,400 paise = ₹444.00 (44.40% of CIF)
    // Net cost after ITC: CIF + BCD + SWS = 122,220 paise (₹1,222.20)

    const result = calculateLandedCost({
      cifAmountPaise: 100000,
      bcdBp: 2000,
      swsBp: 1000,
      igstBp: 1800,
      procurementMode: "DIRECT_IMPORT",
    });

    expect(result.assessableValuePaise).toBe(101000);
    expect(result.bcdPaise).toBe(20200);
    expect(result.swsPaise).toBe(2020);
    expect(result.igstPaise).toBe(22180);
    expect(result.totalDutiesPaise).toBe(44400);
    expect(result.totalLandedCostPaise).toBe(144400);
    expect(result.effectiveCostNetOfItcPaise).toBe(122220);
    expect(result.effectiveDutyRatePercent).toBe(44.4);
    expect(formatPaiseToINR(result.totalDutiesPaise)).toBe("₹444.00");
  });

  it("satisfies Golden Test Vector B: CIF ₹34,000.00 (3,400,000 paise)", () => {
    // Test Vector B from Section 2 of execution_plan_review_amendments.md:
    // CIF: 3,400,000 paise (₹34,000.00)
    // Va: 3,434,000 paise (₹34,340.00)
    // BCD: 686,800 paise (₹6,868.00)
    // SWS: 68,680 paise (₹686.80)
    // IGST base: 3,434,000 + 686,800 + 68,680 = 4,189,480
    // IGST: 754,106.4 -> 754,106 paise (₹7,541.06)
    // Total duties: 686,800 + 68,680 + 754,106 = 1,509,586 paise = ₹15,095.86

    const result = calculateLandedCost({
      cifAmountPaise: 3400000,
      bcdBp: 2000,
      swsBp: 1000,
      igstBp: 1800,
      procurementMode: "DIRECT_IMPORT",
    });

    expect(result.assessableValuePaise).toBe(3434000);
    expect(result.bcdPaise).toBe(686800);
    expect(result.swsPaise).toBe(68680);
    expect(result.igstPaise).toBe(754106);
    expect(result.totalDutiesPaise).toBe(1509586);
    expect(result.totalLandedCostPaise).toBe(4909586);
    expect(result.effectiveCostNetOfItcPaise).toBe(4155480);
  });

  it("handles DOMESTIC_WHOLESALE without customs BCD/SWS", () => {
    const result = calculateLandedCost({
      cifAmountPaise: 100000,
      igstBp: 1800,
      procurementMode: "DOMESTIC_WHOLESALE",
    });

    expect(result.bcdPaise).toBe(0);
    expect(result.swsPaise).toBe(0);
    expect(result.igstPaise).toBe(18000); // 18% GST on domestic purchase
    expect(result.totalDutiesPaise).toBe(18000);
    expect(result.effectiveCostNetOfItcPaise).toBe(100000); // 100% ITC recovery
  });
});
