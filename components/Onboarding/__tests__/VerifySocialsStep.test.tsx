// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import VerifySocialsStep from "@/components/Onboarding/VerifySocialsStep";

const artistProvider = { sorted: [] as unknown[], isLoading: true };

vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => artistProvider,
}));

vi.mock("@/hooks/onboarding/useSocialFix", () => ({
  useSocialFix: () => ({ fixSocial: vi.fn(), fixingArtistId: null }),
}));

describe("VerifySocialsStep", () => {
  it("renders a loading skeleton instead of an empty step while the roster loads", () => {
    artistProvider.sorted = [];
    artistProvider.isLoading = true;

    const { container } = render(<VerifySocialsStep onConfirmed={vi.fn()} />);

    // The step read only `sorted`, so a direct /setup/socials visit rendered a
    // blank step that looked broken until the roster arrived (chat#1889).
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /looks good/i })).toBeNull();
  });

  it("shows the step once the roster has resolved", () => {
    artistProvider.sorted = [];
    artistProvider.isLoading = false;

    const { container } = render(<VerifySocialsStep onConfirmed={vi.fn()} />);

    expect(container.querySelectorAll('.animate-pulse').length).toBe(0);
    expect(screen.getByRole("button", { name: /looks good/i })).toBeDefined();
  });
});
