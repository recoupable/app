// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CatalogCard from "@/components/Catalog/CatalogCard";
import type { Catalog } from "@/types/Catalog";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/hooks/useArtistCatalogSongs", () => ({
  default: () => ({
    data: { pages: [{ pagination: { total_count: 26 } }] },
    isLoading: false,
  }),
}));

const base: Catalog = {
  id: "3f824e19-7052-4a1c-bdee-7380d4424302",
  name: "Brauxelion",
  created_at: "2026-08-06T04:10:06.974381+00:00",
  updated_at: "2026-08-06T04:10:06.974381+00:00",
  measured_song_count: 26,
  valuation: { low: 71.36, mid: 103.9, high: 146.15 },
  owner: {
    id: "fb678396-a68f-4294-ae50-b8cacf9ce77b",
    name: "Sweetman.eth",
    image: "https://img/person.png",
    is_organization: false,
  },
};

describe("CatalogCard", () => {
  it("shows the catalog's estimated value, formatted like the report", () => {
    render(<CatalogCard catalog={base} />);

    // formatValuationAmount — the same compact formatter the report page uses.
    expect(screen.getByText("$103.9")).toBeDefined();
    expect(screen.getByText(/estimated value/i)).toBeDefined();
  });

  it("formats a real catalog band compactly", () => {
    render(
      <CatalogCard
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
      <CatalogCard
        catalog={{ ...base, valuation: null, measured_song_count: 0 }}
      />,
    );

    expect(screen.queryByText("$0")).toBeNull();
    expect(screen.getByText(/not measured/i)).toBeDefined();
  });

  it("shows the owner's avatar with an accessible name", () => {
    render(<CatalogCard catalog={base} />);

    expect(screen.getByLabelText("Owned by Sweetman.eth")).toBeDefined();
  });

  it("labels an organization-owned catalog as the organization's", () => {
    render(
      <CatalogCard
        catalog={{
          ...base,
          owner: {
            id: "org",
            name: "Duetti",
            image: null,
            is_organization: true,
          },
        }}
      />,
    );

    expect(
      screen.getByLabelText("Owned by Duetti (organization)"),
    ).toBeDefined();
  });

  it("falls back to initials when the owner has no image", () => {
    render(
      <CatalogCard
        catalog={{
          ...base,
          owner: {
            id: "org",
            name: "Recoup",
            image: null,
            is_organization: true,
          },
        }}
      />,
    );

    expect(screen.getByText("R")).toBeDefined();
  });

  it("renders without an owner rather than crashing", () => {
    render(<CatalogCard catalog={{ ...base, owner: null }} />);

    expect(screen.getByText("Brauxelion")).toBeDefined();
    expect(screen.queryByLabelText(/owned by/i)).toBeNull();
  });
});
