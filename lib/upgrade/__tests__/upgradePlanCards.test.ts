import { describe, expect, it } from "vitest";
import { UPGRADE_PLAN_CARDS } from "@/lib/upgrade/upgradePlanCards";

describe("UPGRADE_PLAN_CARDS", () => {
  it("carries the same disclosures as /pricing", () => {
    const { starter, pro } = UPGRADE_PLAN_CARDS;
    expect(starter.price).toBe("$19/mo");
    expect(starter.note).toMatch(/\$19 today/);
    expect(starter.features.join(" ")).toMatch(/\$20/);
    expect(starter.features.join(" ")).toMatch(/3 tasks/);
    expect(starter.features.join(" ").toLowerCase()).toMatch(/daily/);
    expect(pro.price).toBe("$99/mo");
    expect(pro.cta).toMatch(/30-day trial/);
    expect(pro.note).toMatch(/\$0 today/);
    expect(pro.note).toMatch(/[Cc]ard required/);
    expect(pro.note).toMatch(/cancel .*day 30/i);
  });

  it("never uses em or en dashes", () => {
    const text = JSON.stringify(UPGRADE_PLAN_CARDS);
    expect(text).not.toMatch(/[–—]/);
  });
});
