import { describe, expect, it } from "vitest";
import { hasStarterPlan } from "@/lib/upgrade/hasStarterPlan";

const base = {
  account_id: "a",
  remaining_credits: 0,
  total_credits: 3_330_000,
  used_credits: 3_330_000,
  is_pro: false,
  timestamp: "2026-08-29T00:00:00Z",
};

describe("hasStarterPlan", () => {
  it("is false against today's api, which has no plan field", () => {
    expect(hasStarterPlan(base)).toBe(false);
    expect(hasStarterPlan(undefined)).toBe(false);
  });

  it("is true once the api's credits response carries a plan", () => {
    expect(hasStarterPlan({ ...base, plan: "free" })).toBe(true);
  });
});
