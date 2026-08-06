// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CatalogValue from "@/components/Catalog/CatalogValue";
import type { Catalog } from "@/types/Catalog";

const base: Catalog = {
  id: "3f824e19-7052-4a1c-bdee-7380d4424302",
  name: "Brauxelion",
  created_at: "2026-08-06T04:10:06.974381+00:00",
  updated_at: "2026-08-06T04:10:06.974381+00:00",
  measured_song_count: 26,
  valuation: { low: 71.36, mid: 103.9, high: 146.15 },
};

describe("CatalogValue", () => {
  it("shows the band's midpoint, formatted like the report", () => {
    render(<CatalogValue catalog={base} />);

    // formatValuationAmount — the same compact formatter the report page uses.
    expect(screen.getByText("$103.9")).toBeDefined();
    expect(screen.getByText(/estimated value/i)).toBeDefined();
  });

  it("formats a real catalog band compactly", () => {
    render(
      <CatalogValue
        catalog={{
          ...base,
          valuation: { low: 900000, mid: 1400000, high: 2100000 },
        }}
      />,
    );

    expect(screen.getByText("$1.4M")).toBeDefined();
  });

  it("says the catalog is not measured instead of showing $0", () => {
    render(
      <CatalogValue
        catalog={{ ...base, valuation: null, measured_song_count: 0 }}
      />,
    );

    expect(screen.queryByText("$0")).toBeNull();
    expect(screen.getByText(/not measured/i)).toBeDefined();
  });

  it("treats a band on an unmeasured catalog as not measured", () => {
    // Defence in depth: measured_song_count is the authority on whether a band
    // means anything, so a stray zero band cannot render as a value.
    render(
      <CatalogValue
        catalog={{
          ...base,
          measured_song_count: 0,
          valuation: { low: 0, mid: 0, high: 0 },
        }}
      />,
    );

    expect(screen.queryByText("$0")).toBeNull();
    expect(screen.getByText(/not measured/i)).toBeDefined();
  });

  it("shows a sub-dollar band as < $1 rather than $0", () => {
    // A measured one-song catalog with a handful of streams really does band at
    // a fraction of a dollar — accurate, but "$0" reads like a bug.
    render(
      <CatalogValue
        catalog={{
          ...base,
          measured_song_count: 1,
          valuation: { low: 0.2, mid: 0.4, high: 0.6 },
        }}
      />,
    );

    expect(screen.getByText("< $1")).toBeDefined();
    expect(screen.queryByText("$0")).toBeNull();
  });
});
