// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FirstTaskConfirm from "@/components/Onboarding/FirstTaskConfirm";
import type { FirstTaskConfirmPhase } from "@/lib/onboarding/getFirstTaskConfirmPhase";

const confirm = vi.fn();
const turnOff = vi.fn();
let phase: FirstTaskConfirmPhase = "creating";
let hasStarted = false;
let task: { id: string } | undefined;

vi.mock("@/hooks/useConfirmFirstTask", () => ({
  useConfirmFirstTask: () => ({
    confirm,
    turnOff,
    phase,
    task,
    hasStarted,
    isTurningOff: false,
  }),
}));

vi.mock("@/lib/tasks/getTaskNextRun", () => ({
  getTaskNextRun: () => null,
}));

afterEach(() => cleanup());

// recoupable/app#1941: the monthly task is created without a click once the
// first report finishes; the question becomes an opt-out.
describe("FirstTaskConfirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    phase = "creating";
    hasStarted = false;
    task = undefined;
  });

  it("creates the monthly task on its own, exactly once", () => {
    const { rerender } = render(<FirstTaskConfirm />);
    rerender(<FirstTaskConfirm />);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: /yes/i })).toBeNull();
  });

  it("does not create again once a create has started", () => {
    hasStarted = true;
    render(<FirstTaskConfirm />);
    expect(confirm).not.toHaveBeenCalled();
  });

  it("confirms the monthly schedule and offers to turn it off", () => {
    phase = "scheduled";
    hasStarted = true;
    task = { id: "task-1" };
    render(<FirstTaskConfirm />);
    expect(screen.getByText(/monthly report is set up/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /turn off/i }));
    expect(turnOff).toHaveBeenCalledTimes(1);
  });

  it("offers a retry when the automatic create failed", () => {
    phase = "failed";
    hasStarted = true;
    render(<FirstTaskConfirm />);
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(confirm).toHaveBeenCalledTimes(1);
  });

  it("says where to set the report up again after turning it off", () => {
    phase = "declined";
    hasStarted = true;
    render(<FirstTaskConfirm />);
    expect(screen.getByText(/turned off/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /tasks/i })).toBeTruthy();
  });
});
