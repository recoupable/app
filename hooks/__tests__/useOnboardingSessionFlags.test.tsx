// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useOnboardingSessionFlags } from "@/hooks/useOnboardingSessionFlags";

describe("useOnboardingSessionFlags", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("starts unskipped", () => {
    const { result } = renderHook(() => useOnboardingSessionFlags("acct-a"));
    expect(result.current.skipped).toBe(false);
  });

  it("skip sets the account-scoped flag; resume clears it", () => {
    const { result } = renderHook(() => useOnboardingSessionFlags("acct-a"));
    act(() => result.current.skip());
    expect(result.current.skipped).toBe(true);
    act(() => result.current.resume());
    expect(result.current.skipped).toBe(false);
  });

  it("does not leak one account's choice to another in the same tab", () => {
    const { result, rerender } = renderHook(
      ({ accountId }: { accountId: string }) =>
        useOnboardingSessionFlags(accountId),
      { initialProps: { accountId: "acct-a" } },
    );
    act(() => result.current.skip());

    rerender({ accountId: "acct-b" });
    expect(result.current.skipped).toBe(false);

    rerender({ accountId: "acct-a" });
    expect(result.current.skipped).toBe(true);
  });
});
