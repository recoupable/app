// @vitest-environment jsdom
import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => {
  const mounted = new Set<string>();
  return {
    pathname: "/labs/intelligent-ui",
    mounted,
    wrap:
      (name: string) =>
      ({ children }: { children?: ReactNode }) => {
        mounted.add(name);
        return children ?? null;
      },
  };
});
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("@/providers/ThemeProvider", () => ({
  ThemeProvider: state.wrap("theme"),
}));
vi.mock("@/providers/PrivyProvider", () => ({
  default: state.wrap("privy"),
}));
vi.mock("@/providers/UserProvder", () => ({
  UserProvider: state.wrap("user"),
}));
vi.mock("@/providers/ArtistProvider", () => ({
  ArtistProvider: state.wrap("artist"),
}));
vi.mock("@/providers/ConversationsProvider", () => ({
  ConversationsProvider: state.wrap("conversations"),
}));
vi.mock("@/providers/PaymentProvider", () => ({
  PaymentProvider: state.wrap("payment"),
}));
vi.mock("@/providers/MiniKitProvider", () => ({
  MiniKitProvider: state.wrap("mini-kit"),
}));
vi.mock("@/providers/WagmiProvider", () => ({
  default: state.wrap("wagmi"),
}));
vi.mock("@/providers/MiniAppProvider", () => ({
  MiniAppProvider: state.wrap("mini-app"),
}));
vi.mock("@/providers/OrganizationProvider", () => ({
  OrganizationProvider: state.wrap("organization"),
}));
vi.mock("@/providers/ApiOverrideSync", () => ({
  default: state.wrap("api-override"),
}));
vi.mock("@/providers/AccountOverrideProvider", () => ({
  AccountOverrideProvider: state.wrap("account-override"),
}));
vi.mock("@/providers/UpgradePromptProvider", () => ({
  UpgradePromptProvider: state.wrap("upgrade"),
}));
vi.mock("@/components/UpgradePrompt/CreditsUpgradePrompt", () => ({
  default: state.wrap("credits-prompt"),
}));
vi.mock("@/components/UpgradePrompt/PlanLimitUpgradeModal", () => ({
  default: state.wrap("plan-prompt"),
}));
vi.mock("@/components/Checkout/CheckoutClaimSync", () => ({
  default: state.wrap("checkout"),
}));

import Providers from "../Providers";

beforeEach(() => {
  state.pathname = "/labs/intelligent-ui";
  state.mounted.clear();
});
afterEach(cleanup);

describe("synthetic playground providers", () => {
  it("renders fixtures with theme but no customer providers or effects", () => {
    render(<Providers>Fixture content</Providers>);
    expect(screen.getByText("Fixture content")).toBeTruthy();
    expect([...state.mounted]).toEqual(["theme"]);
  });

  it.each([
    "/",
    "/context",
    "/labs/other",
    "/labs/intelligent-ui/private",
    "/labs/intelligent-ui-extra",
  ])("preserves normal providers at %s", (pathname) => {
    state.pathname = pathname;
    render(<Providers>Customer content</Providers>);
    expect(screen.getByText("Customer content")).toBeTruthy();
    for (const name of [
      "privy",
      "user",
      "account-override",
      "api-override",
      "payment",
      "checkout",
    ]) {
      expect(state.mounted.has(name)).toBe(true);
    }
  });

  it("preserves the narrower OAuth provider tree", () => {
    state.pathname = "/oauth/authorize";
    render(<Providers>Consent content</Providers>);
    expect([...state.mounted]).toEqual(["theme", "privy"]);
  });

  it("restores normal providers when navigating out of the playground", () => {
    const view = render(<Providers>Content</Providers>);
    state.pathname = "/artists";
    state.mounted.clear();
    view.rerender(<Providers>Content</Providers>);
    expect(state.mounted.has("privy")).toBe(true);
    expect(state.mounted.has("user")).toBe(true);
  });
});
