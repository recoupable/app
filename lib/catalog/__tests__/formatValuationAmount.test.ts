import { describe, expect, it } from "vitest";
import { formatValuationAmount } from "@/lib/catalog/formatValuationAmount";

describe("formatValuationAmount", () => {
  it("formats millions compactly", () => {
    expect(formatValuationAmount(1400000)).toBe("$1.4M");
  });

  it("formats thousands compactly", () => {
    expect(formatValuationAmount(959000)).toBe("$959K");
  });

  it("drops trailing zero decimals", () => {
    expect(formatValuationAmount(2000000)).toBe("$2M");
  });

  it("formats zero", () => {
    expect(formatValuationAmount(0)).toBe("$0");
  });
});
