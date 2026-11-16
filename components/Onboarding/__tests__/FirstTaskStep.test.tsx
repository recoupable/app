// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FirstTaskStep from "@/components/Onboarding/FirstTaskStep";

type TaskRow = { id: string; enabled: boolean };
type TasksQuery = {
  isSuccess: boolean;
  isError: boolean;
  data: TaskRow[] | undefined;
  refetch: () => void;
};
const refetch = vi.fn();
const reportProps = vi.fn();
let tasksQuery: TasksQuery;

vi.mock("@/hooks/useScheduledActions", () => ({
  useScheduledActions: () => tasksQuery,
}));
vi.mock("@/components/Onboarding/FirstTaskReport", () => ({
  default: (props: { autoCreate: boolean }) => {
    reportProps(props);
    return <div>First report</div>;
  },
}));
vi.mock("@/components/Onboarding/ExistingWeeklyReportPanel", () => ({
  default: () => <div>Existing report panel</div>,
}));
// Mirrors the real skip control, a button that performs the skip.
vi.mock("@/components/Onboarding/SetupSkipLink", () => ({
  default: () => <button type="button">Skip for now</button>,
}));

const loaded = (data: TaskRow[]): TasksQuery => ({
  isSuccess: true,
  isError: false,
  data,
  refetch,
});

afterEach(() => cleanup());

describe("FirstTaskStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tasksQuery = loaded([]);
  });

  it("shows the existing schedule when the account already had one on arrival", () => {
    tasksQuery = loaded([{ id: "t-1", enabled: true }]);
    render(<FirstTaskStep />);
    expect(screen.getByText("Existing report panel")).toBeTruthy();
  });

  // Before sign-in resolves the tasks query is disabled: not loading, no data.
  it("waits for the tasks list to load before deciding", () => {
    tasksQuery = { ...loaded([]), isSuccess: false, data: undefined };
    const { rerender } = render(<FirstTaskStep />);
    expect(screen.getByText(/checking your reports/i)).toBeTruthy();

    tasksQuery = loaded([{ id: "t-1", enabled: true }]);
    rerender(<FirstTaskStep />);
    expect(screen.getByText("Existing report panel")).toBeTruthy();
  });

  it("offers a retry and the skip when the tasks list fails to load", () => {
    tasksQuery = {
      ...loaded([]),
      isSuccess: false,
      isError: true,
      data: undefined,
    };
    render(<FirstTaskStep />);
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /skip for now/i })).toBeTruthy();
    expect(screen.queryByText("First report")).toBeNull();
  });

  // The task this step creates must not swap the report for the panel.
  it("keeps the first report on screen and stops auto-creating once a task exists", () => {
    const { rerender } = render(<FirstTaskStep />);
    expect(reportProps).toHaveBeenLastCalledWith({ autoCreate: true });

    tasksQuery = loaded([{ id: "t-new", enabled: true }]);
    rerender(<FirstTaskStep />);
    expect(screen.getByText("First report")).toBeTruthy();
    expect(screen.queryByText("Existing report panel")).toBeNull();
    expect(reportProps).toHaveBeenLastCalledWith({ autoCreate: false });
  });
});
