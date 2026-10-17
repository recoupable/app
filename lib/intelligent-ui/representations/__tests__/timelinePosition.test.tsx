// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTimelinePosition } from "../useTimelinePosition";
import { getTimelineStateKey } from "../getTimelineStateKey";
import { getCompletedExample } from "../../playground/getCompletedExample";
import { playgroundScenarios } from "../../playground/scenarios";

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("local timeline position", () => {
  it.each(["-1", "49", '"28"', "null", "NaN", "9".repeat(80)])(
    "discards invalid or out-of-bounds stored position %s",
    (raw) => {
      localStorage.setItem("test", raw);
      const { result } = renderHook(() => useTimelinePosition("test", 48));
      expect(result.current.restored).toBe(true);
      expect(result.current.position).toBe(0);
    },
  );

  it("restores and saves positions independently across scope changes", () => {
    localStorage.setItem("first", "28");
    localStorage.setItem("second", "8");
    const { result, rerender } = renderHook(
      ({ scope }) => useTimelinePosition(scope, 48),
      { initialProps: { scope: "first" } },
    );
    expect(result.current.position).toBe(28);
    act(() => result.current.setPosition(31.5));
    rerender({ scope: "second" });
    expect(result.current.position).toBe(8);
    expect(localStorage.getItem("first")).toBe("31.5");
    expect(localStorage.getItem("second")).toBe("8");
  });

  it("continues in memory when storage fails", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("disabled");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("full");
    });
    const { result } = renderHook(() => useTimelinePosition("test", 48));
    act(() => result.current.setPosition(20));
    expect(result.current.position).toBe(20);
  });

  it("invalidates cached position when the asset, interval meaning or workspace changes", () => {
    const component = getCompletedExample(
      playgroundScenarios.find((item) => item.id === "song")!,
    ).components[0];
    if (component.type !== "timeline") throw new Error("Expected timeline");
    const original = getTimelineStateKey(component, "workspace-a");
    expect(getTimelineStateKey(component, "workspace-b")).not.toBe(original);
    const changed = structuredClone(component);
    changed.sections[0].label = "New meaning";
    expect(getTimelineStateKey(changed, "workspace-a")).not.toBe(original);
    changed.media!.assetId = "another-version";
    expect(getTimelineStateKey(changed, "workspace-a")).not.toBe(original);
  });
});
