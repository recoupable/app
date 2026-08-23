import { describe, expect, it } from "vitest";
import {
  creditCostForDuration,
  formatCreditCostUsd,
  MUSIC_DEFAULTS,
  MUSIC_RANGES,
} from "@/lib/music/const";

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

describe("slider ranges can represent their own defaults", () => {
  // A range input snaps to its step grid. A default that is not a multiple of
  // the step leaves the thumb somewhere the readout does not claim, and makes
  // the default unreachable once the user drags: guidance_scale shipped as
  // step 0.5 with a 1.7 default and rendered at 1.5.
  it.each([
    ["duration", MUSIC_DEFAULTS.duration, MUSIC_RANGES.duration],
    ["numInferenceSteps", MUSIC_DEFAULTS.numInferenceSteps, MUSIC_RANGES.numInferenceSteps],
    ["guidanceScale", MUSIC_DEFAULTS.guidanceScale, MUSIC_RANGES.guidanceScale],
  ])("%s default sits on its step grid", (_name, value, range) => {
    const steps = (value - range.min) / range.step;
    expect(Math.abs(steps - Math.round(steps))).toBeLessThan(1e-9);
    expect(value).toBeGreaterThanOrEqual(range.min);
    expect(value).toBeLessThanOrEqual(range.max);
  });
});
