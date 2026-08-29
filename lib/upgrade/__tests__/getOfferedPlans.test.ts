import { describe, expect, it } from "vitest";
import { getOfferedPlans } from "@/lib/upgrade/getOfferedPlans";

describe("getOfferedPlans", () => {
  it("offers Pro only when the api does not sell Starter yet", () => {
    expect(getOfferedPlans(false)).toEqual(["pro"]);
  });

  it("offers Starter then Pro once the api sells Starter", () => {
    expect(getOfferedPlans(true)).toEqual(["starter", "pro"]);
  });
});
