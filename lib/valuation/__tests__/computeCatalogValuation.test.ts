import { describe, it, expect } from "vitest";
import { computeCatalogValuation } from "../computeCatalogValuation";

describe("computeCatalogValuation", () => {
  it("computes the central value as annual x 0.0035 x 1.4 x 0.6375 x 13", () => {
    // 1M lifetime streams over 5 years -> 200K annual streams
    const result = computeCatalogValuation({
      totalStreams: 1_000_000,
      catalogAgeYears: 5,
    });
    const annualGross = 200_000 * 0.0035; // 700
    expect(result.annualStreamsProxy).toBe(200_000);
    expect(result.valueBand.central).toBeCloseTo(
      annualGross * 1.4 * 0.6375 * 13,
      6,
    );
    expect(result.valueBand.low).toBeCloseTo(
      annualGross * 1.25 * 0.6375 * 10,
      6,
    );
    expect(result.valueBand.high).toBeCloseTo(
      annualGross * 1.6 * 0.6375 * 16,
      6,
    );
  });

  it("reports lifetime and annual NLS bands", () => {
    const result = computeCatalogValuation({
      totalStreams: 1_000_000,
      catalogAgeYears: 5,
    });
    expect(result.lifetimeNls.central).toBeCloseTo(
      1_000_000 * 0.0035 * 1.4 * 0.6375,
      6,
    );
    expect(result.annualNls.central).toBeCloseTo(
      200_000 * 0.0035 * 1.4 * 0.6375,
      6,
    );
  });

  it("falls back to the 5-year default age when age is missing", () => {
    const result = computeCatalogValuation({ totalStreams: 500_000 });
    expect(result.catalogAgeYears).toBe(5);
    expect(result.assumptions.ageSource).toBe("default_5y");
    expect(result.annualStreamsProxy).toBe(100_000);
  });

  it("uses the reported age when provided", () => {
    const result = computeCatalogValuation({
      totalStreams: 300_000,
      catalogAgeYears: 3,
    });
    expect(result.catalogAgeYears).toBe(3);
    expect(result.assumptions.ageSource).toBe("reported");
    expect(result.annualStreamsProxy).toBe(100_000);
  });

  it("clamps invalid reported ages to the default", () => {
    for (const bad of [0, -2, NaN, null]) {
      const result = computeCatalogValuation({
        totalStreams: 100_000,
        catalogAgeYears: bad as number | null,
      });
      expect(result.catalogAgeYears).toBe(5);
      expect(result.assumptions.ageSource).toBe("default_5y");
    }
  });

  it("values an empty catalog at zero without dividing by zero", () => {
    const result = computeCatalogValuation({
      totalStreams: 0,
      catalogAgeYears: 4,
    });
    expect(result.valueBand).toEqual({ low: 0, central: 0, high: 0 });
  });
});
