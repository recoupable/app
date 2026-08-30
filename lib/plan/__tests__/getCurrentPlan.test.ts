import { describe, expect, it } from "vitest";
import { getCurrentPlan } from "@/lib/plan/getCurrentPlan";

describe("getCurrentPlan", () => {
  it("uses the api's plan when present", () => {
    expect(getCurrentPlan({ plan: "starter", is_pro: false })).toBe("starter");
  });
  it("falls back to is_pro against today's api", () => {
    expect(getCurrentPlan({ is_pro: true })).toBe("pro");
    expect(getCurrentPlan({ is_pro: false })).toBe("free");
  });
  it("is free while credits have not loaded", () => {
    expect(getCurrentPlan(undefined)).toBe("free");
  });
});
