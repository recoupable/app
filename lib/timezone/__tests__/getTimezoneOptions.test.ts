import { afterEach, describe, expect, it, vi } from "vitest";
import { getTimezoneOptions } from "@/lib/timezone/getTimezoneOptions";

const intlWithSupported = Intl as typeof Intl & {
  supportedValuesOf?: (key: "timeZone") => string[];
};

describe("getTimezoneOptions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the runtime's canonical timezone list when available", () => {
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
      () =>
        ({
          resolvedOptions: () => ({ timeZone: "Europe/Paris" }),
        }) as unknown as Intl.DateTimeFormat,
    );
    vi.spyOn(intlWithSupported, "supportedValuesOf").mockReturnValue([
      "Europe/Paris",
      "UTC",
    ]);

    expect(getTimezoneOptions()).toEqual(["Europe/Paris", "UTC"]);
  });

  it("prepends the local zone when the canonical list omits it", () => {
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
      () =>
        ({
          resolvedOptions: () => ({ timeZone: "Pacific/Auckland" }),
        }) as unknown as Intl.DateTimeFormat,
    );
    vi.spyOn(intlWithSupported, "supportedValuesOf").mockReturnValue(["UTC"]);

    expect(getTimezoneOptions()[0]).toBe("Pacific/Auckland");
    expect(getTimezoneOptions()).toContain("UTC");
  });

  it("uses the fallback list when supportedValuesOf is missing", () => {
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
      () =>
        ({
          resolvedOptions: () => ({ timeZone: "America/New_York" }),
        }) as unknown as Intl.DateTimeFormat,
    );
    vi.spyOn(intlWithSupported, "supportedValuesOf").mockReturnValue(
      undefined as unknown as string[],
    );

    const options = getTimezoneOptions();
    expect(options).toContain("America/New_York");
    expect(options).toContain("UTC");
  });
});
