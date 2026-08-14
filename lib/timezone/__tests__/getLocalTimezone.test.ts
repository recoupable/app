import { afterEach, describe, expect, it, vi } from "vitest";
import { getLocalTimezone } from "@/lib/timezone/getLocalTimezone";

describe("getLocalTimezone", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the runtime's resolved IANA timezone", () => {
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
      () =>
        ({
          resolvedOptions: () => ({ timeZone: "America/New_York" }),
        }) as unknown as Intl.DateTimeFormat,
    );

    expect(getLocalTimezone()).toBe("America/New_York");
  });

  it("falls back to UTC when resolution throws", () => {
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(() => {
      throw new Error("no Intl");
    });

    expect(getLocalTimezone()).toBe("UTC");
  });

  it("falls back to UTC when the resolved zone is empty", () => {
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
      () =>
        ({
          resolvedOptions: () => ({ timeZone: "" }),
        }) as unknown as Intl.DateTimeFormat,
    );

    expect(getLocalTimezone()).toBe("UTC");
  });
});
