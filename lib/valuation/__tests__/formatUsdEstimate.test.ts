import { describe, it, expect } from "vitest";
import { formatUsdEstimate, formatUsdBand } from "@/lib/valuation/formatUsdEstimate";

describe("formatUsdEstimate", () => {
  it("formats song-level estimates compactly", () => {
    expect(formatUsdEstimate(4231.7)).toBe("$4.2K");
    expect(formatUsdEstimate(134000)).toBe("$134K");
    expect(formatUsdEstimate(87)).toBe("$87");
  });

  it("formats the hero band as low–high", () => {
    expect(formatUsdBand({ low: 84000, mid: 105000, high: 134000 })).toBe("$84K–$134K");
  });
});
