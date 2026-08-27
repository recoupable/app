import { describe, expect, it } from "vitest";
import {
  creditCostForDuration,
  formatCreditCostUsd,
  MUSIC_DEFAULTS,
  MUSIC_RANGES,
} from "@/lib/music/const";

describe("music pricing shown in the form", () => {
  // Must track recoupable/api#853: fal charges $0.002/s and a credit is $0.01,
  // so 0.2 credits/s is fal's rate with no markup. A quote that disagrees with
  // the API is worse than no quote.
  it("quotes the same 12 credits for a default song as the API charges", () => {
    expect(creditCostForDuration(60)).toBe(12);
  });

  it("applies no floor, matching the API", () => {
    expect(creditCostForDuration(10)).toBe(2);
  });

  it("scales with duration", () => {
    expect(creditCostForDuration(300)).toBe(60);
  });

  it("shows the price in dollars, which is what a customer reasons about", () => {
    expect(formatCreditCostUsd(12)).toBe("$0.12");
    expect(formatCreditCostUsd(60)).toBe("$0.60");
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
