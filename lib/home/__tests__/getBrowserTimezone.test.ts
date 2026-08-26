import { afterEach, describe, expect, it, vi } from "vitest";
import { getBrowserTimezone } from "@/lib/home/getBrowserTimezone";

describe("getBrowserTimezone", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the IANA zone the browser resolves", () => {
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
      () =>
        ({
          resolvedOptions: () => ({ timeZone: "America/Los_Angeles" }),
        }) as unknown as Intl.DateTimeFormat,
    );
    expect(getBrowserTimezone()).toBe("America/Los_Angeles");
  });

  it("returns undefined when the zone is unavailable, so the API default applies", () => {
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(() => {
      throw new Error("no Intl");
    });
    expect(getBrowserTimezone()).toBeUndefined();
  });
});
