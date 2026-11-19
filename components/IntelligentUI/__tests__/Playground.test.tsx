// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Playground from "../Playground";
import PlaygroundThemeToggle from "../PlaygroundThemeToggle";
import { renderToString } from "react-dom/server";

const theme = vi.hoisted(() => ({
  resolvedTheme: undefined as string | undefined,
  setTheme: vi.fn(),
}));
vi.mock("next-themes", () => ({ useTheme: () => theme }));
vi.mock("../PlaygroundWorkspace", async () => {
  const { useState } = await import("react");
  const MockWorkspace = ({ example }: { example: { label: string } }) => {
    const [edits, setEdits] = useState(0);
    return (
      <button onClick={() => setEdits(edits + 1)}>
        {example.label}: {edits} edits
      </button>
    );
  };
  return { default: MockWorkspace };
});
beforeEach(() => {
  theme.resolvedTheme = undefined;
  theme.setTheme.mockReset();
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("lab navigation", () => {
  it("offers and opens release planning only with the development opt-in", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
    const { rerender } = render(<Playground />);
    fireEvent.change(screen.getByRole("combobox", { name: "Example" }), {
      target: { value: "release-plan" },
    });
    expect(
      screen.getByRole("region", { name: "Local release plan" }),
    ).toBeTruthy();
    vi.stubEnv("NODE_ENV", "production");
    rerender(<Playground />);
    expect(screen.queryByRole("option", { name: "Release plan" })).toBeNull();
    expect(
      screen.queryByRole("region", { name: "Local release plan" }),
    ).toBeNull();
  });
  it("keeps the server theme control stable even when a browser theme is known", () => {
    theme.resolvedTheme = "dark";
    expect(renderToString(<PlaygroundThemeToggle />)).toContain(
      'aria-label="Color theme loading"',
    );
  });
  it("switches the selected example and resets its workspace", () => {
    render(<Playground />);
    fireEvent.click(
      screen.getByRole("button", { name: "Listening patterns: 0 edits" }),
    );
    expect(
      screen.getByRole("button", { name: "Listening patterns: 1 edits" }),
    ).toBeTruthy();
    const picker = screen.getByRole("combobox", { name: "Example" });
    fireEvent.change(picker, { target: { value: "song-exploration" } });
    expect(
      (
        screen.getByRole("option", {
          name: "Explore a song",
        }) as HTMLOptionElement
      ).selected,
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: "Explore a song: 0 edits" }),
    ).toBeTruthy();
    fireEvent.change(picker, { target: { value: "listening-patterns" } });
    expect(
      screen.getByRole("button", { name: "Listening patterns: 0 edits" }),
    ).toBeTruthy();
  });

  it("waits for theme resolution and announces the next theme action", () => {
    const { rerender } = render(<Playground />);
    const loading = screen.getByRole("button", {
      name: "Color theme loading",
    }) as HTMLButtonElement;
    expect(loading.disabled).toBe(true);
    fireEvent.click(loading);
    expect(theme.setTheme).not.toHaveBeenCalled();
    theme.resolvedTheme = "dark";
    rerender(<Playground />);
    fireEvent.click(
      screen.getByRole("button", { name: "Switch to light theme" }),
    );
    expect(theme.setTheme).toHaveBeenLastCalledWith("light");
    theme.resolvedTheme = "light";
    rerender(<Playground />);
    fireEvent.click(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    );
    expect(theme.setTheme).toHaveBeenLastCalledWith("dark");
  });
});
