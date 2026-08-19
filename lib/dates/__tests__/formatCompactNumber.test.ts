import { describe, it, expect } from "vitest";
import { formatCompactNumber } from "@/lib/dates/formatCompactNumber";

describe("formatCompactNumber", () => {
  it("formats large counts compactly for the mobile rows", () => {
    expect(formatCompactNumber(128441)).toBe("128.4K");
    expect(formatCompactNumber(1_234_567)).toBe("1.2M");
  });

  it("leaves small counts as plain grouped numbers", () => {
    expect(formatCompactNumber(999)).toBe("999");
    expect(formatCompactNumber(0)).toBe("0");
  });
});
