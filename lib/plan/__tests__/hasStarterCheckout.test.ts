import { describe, expect, it } from "vitest";
import { hasStarterCheckout } from "@/lib/plan/hasStarterCheckout";

describe("hasStarterCheckout", () => {
  it("is true only once the api reports a plan (Starter exists)", () => {
    expect(hasStarterCheckout({ plan: "free" })).toBe(true);
    expect(hasStarterCheckout({})).toBe(false);
    expect(hasStarterCheckout(undefined)).toBe(false);
  });
});
