// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RosterVerifiedPanel from "@/components/Onboarding/RosterVerifiedPanel";

const valuation = {
  show: true,
  artistName: "Drake",
  artistImage: "",
  valuation: { low: 900000, mid: 1400000, high: 2100000 },
  measuredTrackCount: 42,
};

const homeValuation = { current: valuation as unknown };

vi.mock("@/hooks/useHomeValuation", () => ({
  default: () => homeValuation.current,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: React.ComponentProps<"a"> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("RosterVerifiedPanel", () => {
  it("ends setup on the catalog valuation, not a generic green check", () => {
    homeValuation.current = valuation;

    render(<RosterVerifiedPanel />);

    // The payoff: the number the lead converted on (chat#1889).
    expect(screen.getByText(/\$1\.4M/)).toBeDefined();
    expect(screen.getByText(/42 tracks measured/i)).toBeDefined();
    expect(screen.queryByText(/^roster verified$/i)).toBeNull();
  });

  it("falls back to the confirmation state when no valuation exists yet", () => {
    homeValuation.current = { show: false };

    render(<RosterVerifiedPanel />);

    expect(screen.getByText(/roster verified/i)).toBeDefined();
  });
});
