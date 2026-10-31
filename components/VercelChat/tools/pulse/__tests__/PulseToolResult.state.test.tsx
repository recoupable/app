// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PulseToolResult, { type PulseToolResultType } from "../PulseToolResult";

const { state, togglePulse } = vi.hoisted(() => ({
  state: { active: false, isInitialLoading: false, isToggling: false },
  togglePulse: vi.fn(),
}));

vi.mock("@/hooks/usePulseToggle", () => ({
  usePulseToggle: () => ({ ...state, togglePulse }),
}));

const result: PulseToolResultType = { status: "success", pulses: [] };
const request = vi.fn(() => {
  throw new Error("Pulse result tests must not make requests");
});

beforeEach(() => {
  Object.assign(state, {
    active: false,
    isInitialLoading: false,
    isToggling: false,
  });
  togglePulse.mockClear();
  request.mockClear();
  vi.stubGlobal("fetch", request);
  vi.stubGlobal("XMLHttpRequest", request);
  vi.stubGlobal("WebSocket", request);
});

afterEach(() => {
  cleanup();
  expect(request).not.toHaveBeenCalled();
  expect(togglePulse).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});

const states = [
  {
    name: "inactive",
    active: false,
    isInitialLoading: false,
    isToggling: false,
    indicator: "neutral",
  },
  {
    name: "active after loading and mutation settle",
    active: true,
    isInitialLoading: false,
    isToggling: false,
    indicator: "active",
  },
  {
    name: "initial loading with no active value",
    active: false,
    isInitialLoading: true,
    isToggling: false,
    indicator: "neutral",
  },
  {
    name: "initial loading with cached active value",
    active: true,
    isInitialLoading: true,
    isToggling: false,
    indicator: "neutral",
  },
  {
    name: "optimistic activation in progress",
    active: true,
    isInitialLoading: false,
    isToggling: true,
    indicator: "neutral",
  },
  {
    name: "optimistic deactivation in progress",
    active: false,
    isInitialLoading: false,
    isToggling: true,
    indicator: "neutral",
  },
  {
    name: "loading and toggling with active value",
    active: true,
    isInitialLoading: true,
    isToggling: true,
    indicator: "neutral",
  },
  {
    name: "loading and toggling without active value",
    active: false,
    isInitialLoading: true,
    isToggling: true,
    indicator: "neutral",
  },
] as const;

describe("Pulse result state indicator", () => {
  it.each(states)("shows the appropriate indicator for $name", (value) => {
    Object.assign(state, {
      active: value.active,
      isInitialLoading: value.isInitialLoading,
      isToggling: value.isToggling,
    });
    const { container } = render(<PulseToolResult result={result} />);
    const indicator = container.querySelector("svg");
    expect(indicator?.getAttribute("aria-hidden")).toBe("true");

    if (value.indicator === "active") {
      expect(indicator?.classList.contains("text-green-500")).toBe(true);
    } else {
      expect(indicator?.classList.contains("text-muted-foreground")).toBe(true);
      expect(container.querySelector("svg.text-green-500")).toBeNull();
    }
    for (const name of ["h-5", "w-5", "flex-shrink-0"]) {
      expect(indicator?.classList.contains(name)).toBe(true);
    }
    expect(
      screen.getByRole("link", { name: "Pulse" }).getAttribute("href"),
    ).toBe("/tasks?tab=pulses");
    expect(
      screen.getByRole("link", { name: "Pulse" }).getAttribute("target"),
    ).toBe("_blank");
    expect(
      screen.getByRole("link", { name: "Pulse" }).getAttribute("rel"),
    ).toBe("noopener noreferrer");
    expect(screen.getByText("Daily notifications")).not.toBeNull();
    if (value.isInitialLoading) {
      expect(screen.queryByRole("switch")).toBeNull();
      expect(container.querySelectorAll(".animate-pulse").length).toBe(2);
    } else {
      const control = screen.getByRole("switch", {
        name: value.active ? "Active" : "Inactive",
      });
      expect(control.getAttribute("aria-checked")).toBe(String(value.active));
      expect(control.hasAttribute("disabled")).toBe(value.isToggling);
    }
  });

  it("tracks pending and settled state changes without activating the switch", () => {
    const { container, rerender } = render(<PulseToolResult result={result} />);
    expect(container.querySelector("svg.text-green-500")).toBeNull();

    Object.assign(state, { active: true, isToggling: true });
    rerender(<PulseToolResult result={result} />);
    expect(container.querySelector("svg.text-green-500")).toBeNull();
    expect(
      screen.getByRole("switch", { name: "Active" }).hasAttribute("disabled"),
    ).toBe(true);

    state.isToggling = false;
    rerender(<PulseToolResult result={result} />);
    expect(container.querySelector("svg.text-green-500")).not.toBeNull();
    expect(
      screen.getByRole("switch", { name: "Active" }).hasAttribute("disabled"),
    ).toBe(false);

    Object.assign(state, { active: false, isToggling: true });
    rerender(<PulseToolResult result={result} />);
    expect(container.querySelector("svg.text-green-500")).toBeNull();
    expect(
      screen.getByRole("switch", { name: "Inactive" }).hasAttribute("disabled"),
    ).toBe(true);

    state.isToggling = false;
    rerender(<PulseToolResult result={result} />);
    expect(container.querySelector("svg.text-green-500")).toBeNull();
    expect(
      screen.getByRole("switch", { name: "Inactive" }).hasAttribute("disabled"),
    ).toBe(false);
  });

  it("retains the error message without a success indicator or switch", () => {
    state.active = true;
    const { container } = render(
      <PulseToolResult
        result={{ error: 503, message: "Pulse is unavailable" }}
      />,
    );
    expect(screen.getByText("Pulse error")).not.toBeNull();
    expect(screen.getByText("Pulse is unavailable")).not.toBeNull();
    expect(screen.queryByRole("switch")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    expect(container.querySelector("svg.text-green-500")).toBeNull();
  });
});
