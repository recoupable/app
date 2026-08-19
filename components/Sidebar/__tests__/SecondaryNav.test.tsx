// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SecondaryNav from "@/components/Sidebar/SecondaryNav";

vi.mock("@/components/Agents/useAgentData", () => ({
  useAgentData: () => ({ prefetchAgents: vi.fn() }),
}));

const renderNav = (overrides = {}) => {
  const onNavigate = vi.fn();
  render(
    <SecondaryNav
      isExpanded
      isAgents={false}
      isTasks={false}
      isFiles={false}
      isCatalogs={false}
      isArtists={false}
      onNavigate={onNavigate}
      {...overrides}
    />,
  );
  return { onNavigate };
};

describe("SecondaryNav", () => {
  // chat#1912 row 3: Catalogs is the valuation payoff surface and was
  // reachable only by direct URL, so a customer could not find it from the
  // app's own navigation. Reporter and quote live on the issue, not here.
  it("links Catalogs alongside the other tools", () => {
    renderNav();

    expect(
      screen.getByRole("button", { name: /view catalogs/i }),
    ).toBeDefined();
  });

  it("navigates to the catalogs route when Catalogs is clicked", () => {
    const { onNavigate } = renderNav();

    fireEvent.click(screen.getByRole("button", { name: /view catalogs/i }));

    expect(onNavigate).toHaveBeenCalledWith("catalogs");
  });

  // chat#1976: the right-side artist rail is removed; the roster's only
  // entry point is this nav item, so its absence would strand switching.
  it("links Artists and navigates to the roster route", () => {
    const { onNavigate } = renderNav();

    fireEvent.click(screen.getByRole("button", { name: /view artists/i }));

    expect(onNavigate).toHaveBeenCalledWith("artists");
  });

  it("still links the pre-existing tools", () => {
    renderNav();

    expect(screen.getByRole("button", { name: /view agents/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /view tasks/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /view files/i })).toBeDefined();
  });
});
