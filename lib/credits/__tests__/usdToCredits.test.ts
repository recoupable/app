import { describe, expect, it } from "vitest";
import { usdToCredits } from "@/lib/credits/usdToCredits";

describe("usdToCredits", () => {
  it("converts dollars to micro-dollars exactly", () => {
    expect(usdToCredits(0.12)).toBe(120_000);
    expect(usdToCredits(99.99)).toBe(99_990_000);
  });

  it("rounds to the nearest unit, and accepts amounts String() would print in exponent notation", () => {
    expect(usdToCredits(0.1234567)).toBe(123_457);
    expect(usdToCredits(0.0000007)).toBe(1);
  });

  it("never quotes less than one unit", () => {
    expect(usdToCredits(0)).toBe(1);
  });
});
