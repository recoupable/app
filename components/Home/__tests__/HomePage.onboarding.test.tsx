// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/components/Home/HomePage";

vi.mock("@coinbase/onchainkit/minikit", () => ({
  useMiniKit: () => ({ setFrameReady: vi.fn(), isFrameReady: true }),
}));

vi.mock("@/components/VercelChat/NewChatBootstrap", () => ({
  default: () => <div data-testid="chat-bootstrap" />,
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

vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: "acct-test" } }),
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

describe("HomePage onboarding gate (single source of truth)", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("renders the sequence with the step card as an h3 under the container h2", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /finish setting up your account/i,
      }),
    ).toBeDefined();
    expect(
      screen.getByRole("heading", { level: 3, name: /confirm your artists/i }),
    ).toBeDefined();
    expect(screen.queryAllByRole("heading", { level: 1 })).toHaveLength(0);
  });

  it("skip drops to the app with the pinned checklist", () => {
    render(<HomePage />);
    fireEvent.click(screen.getByRole("button", { name: /skip for now/i }));
    expect(screen.getByTestId("chat-bootstrap")).toBeDefined();
    expect(
      screen.getByRole("complementary", { name: /onboarding checklist/i }),
    ).toBeDefined();
  });

  it("positions the checklist inside the content area, not fixed to the viewport under the right rail", () => {
    render(<HomePage />);
    fireEvent.click(screen.getByRole("button", { name: /skip for now/i }));
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
    render(<HomePage />);
    fireEvent.click(screen.getByRole("button", { name: /skip for now/i }));
    expect(screen.queryByRole("button", { name: /dismiss/i })).toBeNull();
  });

  it("the Continue button re-opens the sequence", () => {
    render(<HomePage />);
    fireEvent.click(screen.getByRole("button", { name: /skip for now/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(
      screen.getByRole("heading", { level: 3, name: /confirm your artists/i }),
    ).toBeDefined();
  });
});
