import { describe, expect, it } from "vitest";
import { getUserProfileState } from "@/lib/auth/getUserProfileState";

describe("getUserProfileState", () => {
  // chat#1912 row 2. A signed-out visitor saw "Sign In" at the top of the side
  // menu AND a user-profile skeleton pinned at the bottom, still both present
  // 12s later — the skeleton can never resolve because there is no account to
  // load. Reported by a referred first-time visitor 2026-07-29.
  it("is signed-out when Privy has resolved with no session", () => {
    expect(
      getUserProfileState({
        isPrivyReady: true,
        isAuthenticated: false,
        hasWallet: false,
        hasUserData: false,
      }),
    ).toBe("signed-out");
  });

  /**
   * Review finding (codex P2 / cubic P2, 2026-07-30). A Farcaster mini-app
   * visitor is a real signed-in user with no Privy session: useAutoLogin skips
   * Privy login when isMiniApp, while useUser still bootstraps the account from
   * the wagmi address. Gating on Privy's flag alone would have hidden their
   * profile chip entirely — a regression, not the bug this PR set out to fix.
   */
  it("treats a wallet-only session as signed in", () => {
    expect(
      getUserProfileState({
        isPrivyReady: true,
        isAuthenticated: false,
        hasWallet: true,
        hasUserData: true,
      }),
    ).toBe("ready");
  });

  it("is loading for a wallet-only session whose account is still fetching", () => {
    expect(
      getUserProfileState({
        isPrivyReady: true,
        isAuthenticated: false,
        hasWallet: true,
        hasUserData: false,
      }),
    ).toBe("loading");
  });

  it("stays signed-out even if stale account data lingers", () => {
    // Guards the logout path: the chip must disappear the moment the session
    // goes, not linger until React Query evicts the account.
    expect(
      getUserProfileState({
        isPrivyReady: true,
        isAuthenticated: false,
        hasWallet: false,
        hasUserData: true,
      }),
    ).toBe("signed-out");
  });

  it("is loading while Privy has not resolved yet", () => {
    expect(
      getUserProfileState({
        isPrivyReady: false,
        isAuthenticated: false,
        hasWallet: false,
        hasUserData: false,
      }),
    ).toBe("loading");
  });

  it("is loading for an authenticated session whose account is still fetching", () => {
    expect(
      getUserProfileState({
        isPrivyReady: true,
        isAuthenticated: true,
        hasWallet: false,
        hasUserData: false,
      }),
    ).toBe("loading");
  });

  it("is ready once the authenticated account has loaded", () => {
    expect(
      getUserProfileState({
        isPrivyReady: true,
        isAuthenticated: true,
        hasWallet: false,
        hasUserData: true,
      }),
    ).toBe("ready");
  });
});
