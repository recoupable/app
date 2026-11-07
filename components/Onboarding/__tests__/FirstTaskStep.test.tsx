// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FirstTaskStep from "@/components/Onboarding/FirstTaskStep";

type TaskRow = { id: string; enabled: boolean };
const refetch = vi.fn();
let tasksQuery: {
  isSuccess: boolean;
  isError: boolean;
  data: TaskRow[] | undefined;
  refetch: typeof refetch;
};
const reportRunProps = vi.fn();

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    user: { email: { address: "owner@example.com" } },
    ready: true,
  }),
}));
vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => ({
    selectedArtist: { name: "Luh Tyler", account_id: "artist-1" },
    isLoading: false,
  }),
}));
vi.mock("@/hooks/useCatalogs", () => ({
  default: () => ({
    isLoading: false,
    data: { catalogs: [{ name: "Debut" }] },
  }),
}));
vi.mock("@/hooks/useNewChatBootstrap", () => ({
  useNewChatBootstrap: () => ({
    status: "ready",
    chatId: "chat-1",
    sessionId: "s-1",
  }),
}));
vi.mock("@/hooks/useScheduledActions", () => ({
  useScheduledActions: () => tasksQuery,
}));
vi.mock("@/components/Onboarding/FirstTaskReportRun", () => ({
  default: (props: { autoCreate: boolean }) => {
    reportRunProps(props);
    return <div>First report run</div>;
  },
}));
vi.mock("@/components/Onboarding/ExistingWeeklyReportPanel", () => ({
  default: () => <div>Existing report panel</div>,
}));
vi.mock("@/components/Onboarding/SetupSkipLink", () => ({
  default: () => <a href="https://example.test/skip">Skip for now</a>,
}));

const loaded = (data: TaskRow[]) => ({
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
  // Deciding then would ignore an existing schedule and create a duplicate.
  it("waits for the tasks list to load before deciding", () => {
    tasksQuery = { isSuccess: false, isError: false, data: undefined, refetch };
    const { rerender } = render(<FirstTaskStep />);
    expect(screen.getByText(/checking your reports/i)).toBeTruthy();
    expect(screen.queryByText("First report run")).toBeNull();

    tasksQuery = loaded([{ id: "t-1", enabled: true }]);
    rerender(<FirstTaskStep />);
    expect(screen.getByText("Existing report panel")).toBeTruthy();
  });

  it("offers a retry when the tasks list fails to load", () => {
    tasksQuery = { isSuccess: false, isError: true, data: undefined, refetch };
    render(<FirstTaskStep />);
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("First report run")).toBeNull();
    expect(screen.getByRole("link", { name: /skip for now/i })).toBeTruthy();
  });

  // The task is now created automatically when the first report finishes; the
  // tasks refetch must not swap the report the user is reading for the panel.
  it("keeps the first report on screen after its task is created", () => {
    const { rerender } = render(<FirstTaskStep />);
    expect(screen.getByText("First report run")).toBeTruthy();

    tasksQuery = loaded([{ id: "t-new", enabled: true }]);
    rerender(<FirstTaskStep />);
    expect(screen.getByText("First report run")).toBeTruthy();
    expect(screen.queryByText("Existing report panel")).toBeNull();
  });

  it("auto-creates only while the account has no active task", () => {
    const { rerender } = render(<FirstTaskStep />);
    expect(reportRunProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ autoCreate: true }),
    );

    tasksQuery = loaded([{ id: "t-new", enabled: true }]);
    rerender(<FirstTaskStep />);
    expect(reportRunProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ autoCreate: false }),
    );
  });

  it("describes a monthly report", () => {
    render(<FirstTaskStep />);
    expect(
      screen.getByRole("heading", { name: /your first monthly report/i }),
    ).toBeTruthy();
    expect(screen.queryByText(/monday|weekly/i)).toBeNull();
  });
});
