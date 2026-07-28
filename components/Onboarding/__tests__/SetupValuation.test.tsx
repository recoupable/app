// @vitest-environment jsdom
import React from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SetupValuation from "@/components/Onboarding/SetupValuation";

const replace = vi.fn();
let catalogsResult: Record<string, unknown>;
let valuationResult: Record<string, unknown>;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/hooks/useCatalogs", () => ({
  default: () => catalogsResult,
}));

vi.mock("@/hooks/useHomeValuation", () => ({
  default: () => valuationResult,
}));

vi.mock("@/components/Home/ValuationHero", () => ({
  default: () => <div>hero</div>,
}));

describe("SetupValuation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    valuationResult = { show: false };
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

  it("redirects to /catalogs once settled with no catalog", () => {
    catalogsResult = {
      data: { catalogs: [] },
      isLoading: false,
      isPending: false,
      isError: false,
    };

    render(<SetupValuation />);

    expect(replace).toHaveBeenCalledWith("/catalogs");
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
});
