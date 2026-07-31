// @vitest-environment jsdom
import React from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SetupValuation from "@/components/Onboarding/SetupValuation";

const replace = vi.fn();
let catalogsResult: Record<string, unknown>;
let valuationResult: Record<string, unknown>;
let artists: { isWorkspace?: boolean }[];

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

// useSetupValuation invalidates the measurements query to poll a seeded
// catalog out of the measuring state (chat#1912 row 9); these tests render the
// component directly, so there is no provider to supply the real client.
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("@/hooks/useCatalogs", () => ({
  default: () => catalogsResult,
}));

vi.mock("@/hooks/useHomeValuation", () => ({
  default: () => valuationResult,
}));

// Seeding fires on the first artist add, so the roster is what tells this route
// a catalog is still coming (chat#1912 row 9).
vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => ({ sorted: artists }),
}));

vi.mock("@/components/Home/ValuationHero", () => ({
  default: () => <div>hero</div>,
}));

describe("SetupValuation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    valuationResult = { show: false };
    artists = [{ isWorkspace: false }];
  });

  // `useCatalogs` is `enabled: !!accountId && authenticated`, and a *disabled*
  // TanStack Query v5 query reports isPending true / isFetching false — so
  // `isLoading` is false while Privy is still resolving. Redirecting on that
  // bounced every cold load of /setup/valuation, which is the route the
  // welcome email's payoff link points at (chat#1889).
  it("does not redirect while the catalogs query has not resolved", () => {
    catalogsResult = {
      data: undefined,
      isLoading: false,
      isPending: true,
      isError: false,
    };

    render(<SetupValuation />);

    expect(replace).not.toHaveBeenCalled();
  });


  it("redirects to /catalogs when the catalogs read fails", () => {
    catalogsResult = {
      data: undefined,
      isLoading: false,
      isPending: false,
      isError: true,
    };

    render(<SetupValuation />);

    expect(replace).toHaveBeenCalledWith("/catalogs");
  });

  it("renders the hero and does not redirect when a valuation is available", () => {
    catalogsResult = {
      data: { catalogs: [{ id: "cat-1" }] },
      isLoading: false,
      isPending: false,
      isError: false,
    };
    valuationResult = {
      show: true,
      artistName: "Ana Bárbara",
      artistImage: "https://i.scdn.co/image/x.jpg",
      valuation: { low: 267000, mid: 389000, high: 547000 },
      measuredTrackCount: 79,
    };

    const { getByText } = render(<SetupValuation />);

    expect(getByText("hero")).toBeDefined();
    expect(replace).not.toHaveBeenCalled();
  });
  // Seeding (chat#1889 row 8) creates the catalog seconds after the first
  // artist is added, but its measurements land later — so this window is now
  // routine, not theoretical. Without a terminal state the route renders a
  // skeleton forever: the redirect cannot fire (there IS a catalog) and the
  // hero cannot render (nothing measured yet).
  it("shows a measuring state, not an endless skeleton, when the catalog has no valuation yet", () => {
    catalogsResult = {
      data: { catalogs: [{ id: "cat-1" }] },
      isLoading: false,
      isPending: false,
      isError: false,
    };
    valuationResult = { show: false };
    artists = [{ isWorkspace: false }];

    const { getByText } = render(<SetupValuation />);

    expect(getByText(/measuring your catalog/i)).toBeDefined();
    expect(replace).not.toHaveBeenCalled();
  });

  /**
   * Measured on the preview 2026-07-31: the catalog appears ~15s after the
   * artist is added, so a signup following the flow arrives here with an empty
   * catalog list. Redirecting then dropped them on an empty /catalogs.
   */
  it("waits on the measuring state during seeding instead of redirecting", () => {
    catalogsResult = { data: { catalogs: [] }, isPending: false, isError: false };
    artists = [{ isWorkspace: false }];

    const { getByText } = render(<SetupValuation />);

    expect(getByText(/Measuring your catalog/i)).toBeDefined();
    expect(replace).not.toHaveBeenCalled();
  });

  it("still redirects when there is no artist and no catalog", () => {
    catalogsResult = { data: { catalogs: [] }, isPending: false, isError: false };
    artists = [];

    render(<SetupValuation />);

    expect(replace).toHaveBeenCalledWith("/catalogs");
  });
});
