// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CatalogReportCta from "@/components/Catalog/report/CatalogReportCta";

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

describe("CatalogReportCta", () => {
  it("routes to the canonical /setup/tasks step, not a retired /onboarding mount", () => {
    render(<CatalogReportCta />);
    const cta = screen.getByRole("link", { name: /set up your weekly report/i });

    // This CTA is the landing page for both the marketing valuation funnel and
    // the valuation email, so it must point at the canonical setup sequence
    // (chat#1889) — never at `/onboarding/*`, and never at `/`, which would
    // drop a funnel signup on the home surface instead of the step.
    expect(cta.getAttribute("href")).toBe("/setup/tasks");
    expect(cta.getAttribute("href")).not.toContain("/onboarding");
  });
});
