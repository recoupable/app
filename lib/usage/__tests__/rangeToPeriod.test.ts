import { describe, expect, it } from "vitest";
import rangeToPeriod from "@/lib/usage/rangeToPeriod";

const now = new Date("2026-08-27T15:00:00.000Z");

describe("rangeToPeriod", () => {
  it("ends now and starts the selected span earlier", () => {
    expect(rangeToPeriod("24h", now)).toEqual({
      from: "2026-08-26T15:00:00.000Z",
      to: "2026-08-27T15:00:00.000Z",
    });
    expect(rangeToPeriod("7d", now).from).toBe("2026-08-20T15:00:00.000Z");
    expect(rangeToPeriod("30d", now).from).toBe("2026-07-28T15:00:00.000Z");
  });

  it("counts months on the calendar for 3m, 12m and 24m", () => {
    expect(rangeToPeriod("3m", now).from).toBe("2026-05-27T15:00:00.000Z");
    expect(rangeToPeriod("12m", now).from).toBe("2025-08-27T15:00:00.000Z");
    expect(rangeToPeriod("24m", now).from).toBe("2024-08-27T15:00:00.000Z");
  });
});
