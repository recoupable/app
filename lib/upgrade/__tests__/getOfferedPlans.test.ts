import { describe, expect, it } from "vitest";
import { getOfferedPlans } from "@/lib/upgrade/getOfferedPlans";

const base = {
  account_id: "a",
  remaining_credits: 0,
  total_credits: 3_330_000,
  used_credits: 3_330_000,
  is_pro: false,
  timestamp: "2026-08-29T00:00:00Z",
};

describe("getOfferedPlans", () => {
  it("offers Pro only when the api does not report plans yet", () => {
    expect(getOfferedPlans(base)).toEqual(["pro"]);
    expect(getOfferedPlans(undefined)).toEqual(["pro"]);
  });

  it("offers Starter then Pro to a Free account once the api reports plans", () => {
    expect(getOfferedPlans({ ...base, plan: "free" })).toEqual(["starter", "pro"]);
  });

  it("never offers a Starter account its own plan", () => {
    expect(getOfferedPlans({ ...base, plan: "starter" })).toEqual(["pro"]);
  });
});
