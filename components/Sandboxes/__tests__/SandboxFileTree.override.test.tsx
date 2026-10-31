// @vitest-environment jsdom
import React from "react";
import { expect, it, vi } from "vitest";
import {
  fixture,
  render,
  screen,
  fireEvent,
  SandboxFileTree,
} from "./guardedJourney.fixture";

vi.mock("@/providers/AccountOverrideProvider", () => ({
  useAccountOverride: () => ({ accountIdOverride: "selected-b", email: null }),
}));

it("shows read-only files without upload controls for a selected account", () => {
  render(<SandboxFileTree />);
  expect(screen.getByText(/selected account are read-only/)).toBeDefined();
  expect(screen.getByText("Opened draft")).toBeDefined();
  expect(screen.queryByText("Drop replacement")).toBeNull();
  const protect = screen.getByRole("checkbox") as HTMLInputElement;
  expect(protect.disabled).toBe(true);
  fireEvent.click(protect);
  expect(fixture.legacy).not.toHaveBeenCalled();
});

it("does not offer uploads for an empty selected account", () => {
  fixture.empty = true;
  render(<SandboxFileTree />);
  expect(screen.getByText("No files yet.")).toBeDefined();
  expect(screen.queryByLabelText("Upload files")).toBeNull();
});
