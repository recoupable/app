// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RosterSocialsFlow from "@/components/Onboarding/RosterSocialsFlow";
import SetupProgress from "@/components/Onboarding/SetupProgress";
import { vi } from "vitest";

vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => ({ sorted: [], isLoading: false }),
}));

vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: "acct-test" } }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/hooks/onboarding/useAddRosterArtist", () => ({
  useAddRosterArtist: () => ({ addArtist: vi.fn(), isAdding: false }),
}));

describe("SetupProgress", () => {
  it("counts against the shared 4-checkpoint vocabulary", () => {
    render(<SetupProgress step="socials" />);
    expect(screen.getByText(/step 2 of 4/i)).toBeDefined();
  });

  it("puts the final step last, not at its own private count", () => {
    render(<SetupProgress step="task" />);
    expect(screen.getByText(/step 4 of 4/i)).toBeDefined();
  });
});

describe("RosterSocialsFlow progress", () => {
  it("no longer renders its own 'of 2' denominator", () => {
    render(<RosterSocialsFlow />);
    // Regression guard (chat#1889): the flow used to count "Step 1 of 2" from
    // local state while the checklist counted 4 — one account, two answers.
    expect(screen.queryByText(/of 2$/i)).toBeNull();
    expect(screen.getByText(/step 1 of 4/i)).toBeDefined();
  });
});
