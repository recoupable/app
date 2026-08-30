import { describe, expect, it } from "vitest";
import { formatCadence } from "@/lib/upgrade/formatCadence";

describe("formatCadence", () => {
  it("names the plan cadences in words", () => {
    expect(formatCadence(10080)).toBe("weekly");
    expect(formatCadence(1440)).toBe("daily");
    expect(formatCadence(60)).toBe("hourly");
  });

  it("falls back to minutes for anything else", () => {
    expect(formatCadence(30)).toBe("every 30 minutes");
  });
});
