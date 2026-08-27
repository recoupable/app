import { describe, expect, it } from "vitest";
import { CREDIT_DECIMALS } from "@/lib/credits/creditDecimals";

describe("CREDIT_DECIMALS", () => {
  it("is USDC's six decimals, the same value as the API and the database", () => {
    expect(CREDIT_DECIMALS).toBe(6);
  });
});
