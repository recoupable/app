// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useMeasuringPoll from "@/hooks/useMeasuringPoll";

describe("useMeasuringPoll", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  /**
   * The mechanism behind two routes getting out of "Measuring your catalog" on
   * their own: /catalogs/{id} (chat#1912 row 1) and /setup/valuation (row 9).
   * Without it a signup sits on static text until they refresh by hand.
   */
  it("re-reads on an interval while measuring", () => {
    const refetch = vi.fn();
    renderHook(() => useMeasuringPoll(true, refetch));

    expect(refetch).not.toHaveBeenCalled();
    vi.advanceTimersByTime(5000);
    expect(refetch).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(10000);
    expect(refetch).toHaveBeenCalledTimes(3);
  });

  it("does not poll when not measuring", () => {
    const refetch = vi.fn();
    renderHook(() => useMeasuringPoll(false, refetch));

    vi.advanceTimersByTime(30000);
    expect(refetch).not.toHaveBeenCalled();
  });

  // A poll that outlives the state it was watching would keep hitting the api
  // for as long as the tab is open.
  it("stops once measuring ends", () => {
    const refetch = vi.fn();
    const { rerender } = renderHook(
      ({ measuring }) => useMeasuringPoll(measuring, refetch),
      { initialProps: { measuring: true } },
    );

    vi.advanceTimersByTime(5000);
    expect(refetch).toHaveBeenCalledTimes(1);

    rerender({ measuring: false });
    vi.advanceTimersByTime(30000);
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("stops on unmount", () => {
    const refetch = vi.fn();
    const { unmount } = renderHook(() => useMeasuringPoll(true, refetch));

    unmount();
    vi.advanceTimersByTime(30000);
    expect(refetch).not.toHaveBeenCalled();
  });
});
