// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useOnboardingSessionFlags } from "@/hooks/useOnboardingSessionFlags";

describe("useOnboardingSessionFlags", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("starts unskipped and undismissed", () => {
    const { result } = renderHook(() => useOnboardingSessionFlags("acct-a"));
    expect(result.current.skipped).toBe(false);
    expect(result.current.checklistDismissed).toBe(false);
  });

  it("skip and dismissChecklist set session-scoped flags", () => {
    const { result } = renderHook(() => useOnboardingSessionFlags("acct-a"));
    act(() => result.current.skip());
    act(() => result.current.dismissChecklist());
    expect(result.current.skipped).toBe(true);
    expect(result.current.checklistDismissed).toBe(true);
  });

  it("resume clears both flags", () => {
    const { result } = renderHook(() => useOnboardingSessionFlags("acct-a"));
    act(() => result.current.skip());
    act(() => result.current.dismissChecklist());
    act(() => result.current.resume());
    expect(result.current.skipped).toBe(false);
    expect(result.current.checklistDismissed).toBe(false);
  });

  it("does not leak one account's choices to another in the same tab", () => {
    const { result, rerender } = renderHook(
      ({ accountId }: { accountId: string }) =>
        useOnboardingSessionFlags(accountId),
      { initialProps: { accountId: "acct-a" } },
    );
    act(() => result.current.skip());
    act(() => result.current.dismissChecklist());

    rerender({ accountId: "acct-b" });
    expect(result.current.skipped).toBe(false);
    expect(result.current.checklistDismissed).toBe(false);

    rerender({ accountId: "acct-a" });
    expect(result.current.skipped).toBe(true);
    expect(result.current.checklistDismissed).toBe(true);
  });
});
