// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/components/Home/HomePage";

const replace = vi.fn();
const SKIP_KEY = "recoup-onboarding-skipped:acct-test";

vi.mock("@coinbase/onchainkit/minikit", () => ({
  useMiniKit: () => ({ setFrameReady: vi.fn(), isFrameReady: true }),
}));

vi.mock("@/components/VercelChat/NewChatBootstrap", () => ({
  default: () => <div data-testid="chat-bootstrap" />,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: "acct-test" } }),
}));

// Checkout-intent handling is covered by __tests__/shouldTriggerCheckoutIntent.test.ts;
// this suite only exercises the onboarding gate.
vi.mock("@/hooks/useCheckoutIntent", () => ({
  default: () => {},
}));

vi.mock("@/hooks/useOnboardingState", () => ({
  useOnboardingState: () => ({
    isReady: true,
    step: "artists",
    checkpoints: [
      { id: "artists", complete: false },
      { id: "socials", complete: false },
      { id: "catalog", complete: false },
      { id: "task", complete: false },
    ],
  }),
}));

describe("HomePage onboarding gate — one canonical surface", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    replace.mockClear();
  });

  it("forwards an incomplete account into /setup instead of hosting its own sequence", () => {
    render(<HomePage />);
    expect(replace).toHaveBeenCalledWith("/setup");
  });

  it("renders no competing step surface of its own", () => {
    render(<HomePage />);
    // The card-based sequence (OnboardingSequence + OnboardingStepCard) is gone:
    // it only linked out to the generic app pages, so a direct signup never
    // reached the interactive steps the welcome email's /setup/* links do.
    expect(
      screen.queryByRole("heading", {
        name: /finish setting up your account/i,
      }),
    ).toBeNull();
    expect(
      screen.queryByRole("heading", { name: /confirm your artists/i }),
    ).toBeNull();
  });

  it("skip drops to the app with the pinned checklist and does not forward", () => {
    window.sessionStorage.setItem(SKIP_KEY, "1");
    render(<HomePage />);
    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByTestId("chat-bootstrap")).toBeDefined();
    expect(
      screen.getByRole("complementary", { name: /onboarding checklist/i }),
    ).toBeDefined();
  });

  it("positions the checklist inside the content area, not fixed to the viewport under the right rail", () => {
    window.sessionStorage.setItem(SKIP_KEY, "1");
    render(<HomePage />);
    const checklist = screen.getByRole("complementary", {
      name: /onboarding checklist/i,
    });
    // Regression guard: `fixed` pinned the card to the viewport edge, where
    // the z-[65] ArtistsSidebar rail clipped it off-screen.
    expect(checklist.className).not.toContain("fixed");
    expect(checklist.className).toContain("absolute");
    expect(checklist.parentElement?.className).toContain("relative");
  });

  it("has no dismiss control — the checklist is a persistent reminder", () => {
    window.sessionStorage.setItem(SKIP_KEY, "1");
    render(<HomePage />);
    expect(screen.queryByRole("button", { name: /dismiss/i })).toBeNull();
  });

  it("the Continue button re-arms the gate, forwarding back into /setup", () => {
    window.sessionStorage.setItem(SKIP_KEY, "1");
    render(<HomePage />);
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(replace).toHaveBeenCalledWith("/setup");
  });
});
