import { describe, expect, it } from "vitest";
import { getSetupPathForStep } from "@/lib/onboarding/getSetupPathForStep";
import { ONBOARDING_STEP_IDS } from "@/lib/onboarding/types";

describe("getSetupPathForStep", () => {
  it("maps every derived step to its canonical /setup route", () => {
    expect(getSetupPathForStep("artists")).toBe("/setup/artists");
    expect(getSetupPathForStep("socials")).toBe("/setup/socials");
    expect(getSetupPathForStep("catalog")).toBe("/setup/catalog");
    expect(getSetupPathForStep("task")).toBe("/setup/tasks");
  });

  it("sends a complete account home, not into the sequence", () => {
    expect(getSetupPathForStep("complete")).toBe("/");
  });

  it("covers every step id, so a new checkpoint can't route to undefined", () => {
    for (const step of ONBOARDING_STEP_IDS) {
      expect(getSetupPathForStep(step)).toMatch(/^\/setup\//);
    }
  });
});
