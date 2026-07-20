import { describe, it, expect } from "vitest";
import {
  nlsBandFromSpotifyGross,
  GROSS_UP,
  DISTRIBUTION_FEE,
  ROYALTY_SHARE,
} from "../nlsBandFromSpotifyGross";

describe("nlsBandFromSpotifyGross", () => {
  it("uses the house assumption constants (mirror of marketing)", () => {
    expect(GROSS_UP).toEqual({ low: 1.25, central: 1.4, high: 1.6 });
    expect(DISTRIBUTION_FEE).toBe(0.15);
    expect(ROYALTY_SHARE).toBe(0.25);
  });

  it("grosses up to all DSPs then takes the post-fee, post-royalty share", () => {
    // net = (1 - 0.15) * (1 - 0.25) = 0.6375
    const band = nlsBandFromSpotifyGross(1000);
    expect(band.low).toBeCloseTo(1000 * 1.25 * 0.6375, 6);
    expect(band.central).toBeCloseTo(1000 * 1.4 * 0.6375, 6);
    expect(band.high).toBeCloseTo(1000 * 1.6 * 0.6375, 6);
  });

  it("returns zeros for zero gross", () => {
    expect(nlsBandFromSpotifyGross(0)).toEqual({ low: 0, central: 0, high: 0 });
  });
});
