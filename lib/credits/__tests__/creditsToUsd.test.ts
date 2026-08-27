import { describe, expect, it } from "vitest";
import { creditsToUsd } from "@/lib/credits/creditsToUsd";

describe("creditsToUsd", () => {
  it("reads a balance the API returns as micro-dollars", () => {
    expect(creditsToUsd(92_440_000)).toBe(92.44);
    expect(creditsToUsd(3_330_000)).toBe(3.33);
  });

  it("keeps sub-cent amounts exact instead of rounding them away", () => {
    expect(creditsToUsd(2_000)).toBe(0.002);
    expect(creditsToUsd(1)).toBe(0.000001);
  });

  it("is zero for zero and negative for an overdrawn balance", () => {
    expect(creditsToUsd(0)).toBe(0);
    expect(creditsToUsd(-5_125)).toBe(-0.005125);
  });
});
