// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import useIsMobile from "@/hooks/useIsMobile";

const useMediaQuery = vi.hoisted(() => vi.fn(() => false));

vi.mock("usehooks-ts", () => ({ useMediaQuery }));

describe("useIsMobile", () => {
  /**
   * chat#1912 row 5. usehooks-ts defaults `initializeWithValue` to true, which
   * evaluates window.matchMedia during the very first render — including the
   * hydration render. The server has no matchMedia and renders the desktop
   * branch, so on a narrow viewport the client's first render disagreed and
   * Header emitted an extra "Add Your Artist" button the server never sent.
   * React threw #418 and regenerated the whole tree on every page load.
   */
  it("does not evaluate the media query during the hydration render", () => {
    renderHook(() => useIsMobile());

    expect(useMediaQuery).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ initializeWithValue: false }),
    );
  });

  it("keeps the 768px breakpoint", () => {
    renderHook(() => useIsMobile());

    expect(useMediaQuery).toHaveBeenCalledWith(
      "(max-width: 768px)",
      expect.anything(),
    );
  });

  it("returns what the media query reports", () => {
    useMediaQuery.mockReturnValue(true);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });
});
