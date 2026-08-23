import { describe, expect, it } from "vitest";
import { creditCostForDuration, formatCreditCostUsd } from "@/lib/music/const";

describe("music pricing shown in the form", () => {
  it("quotes the same 30 credits for a default song as the API charges", () => {
    expect(creditCostForDuration(60)).toBe(30);
  });

  it("applies the same floor as the API", () => {
    expect(creditCostForDuration(10)).toBe(15);
  });

  it("scales with duration", () => {
    expect(creditCostForDuration(300)).toBe(150);
  });

  it("shows the price in dollars, which is what a customer reasons about", () => {
    expect(formatCreditCostUsd(30)).toBe("$0.30");
    expect(formatCreditCostUsd(150)).toBe("$1.50");
  });
});
