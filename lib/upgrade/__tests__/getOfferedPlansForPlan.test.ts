import { describe, expect, it } from "vitest";
import { getOfferedPlansForPlan } from "@/lib/upgrade/getOfferedPlansForPlan";

describe("getOfferedPlansForPlan", () => {
  it("offers both paid plans to a Free account", () => {
    expect(getOfferedPlansForPlan("free")).toEqual(["starter", "pro"]);
  });

  it("offers only Pro to a Starter account", () => {
    expect(getOfferedPlansForPlan("starter")).toEqual(["pro"]);
  });

  it("offers nothing to a Pro account", () => {
    expect(getOfferedPlansForPlan("pro")).toEqual([]);
  });
});
