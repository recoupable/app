// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FirstTaskStep from "@/components/Onboarding/FirstTaskStep";

type TaskRow = { id: string; enabled: boolean };
let tasksQuery: { isLoading: boolean; data: TaskRow[] | undefined };

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
  default: () => <div>First report run</div>,
}));
vi.mock("@/components/Onboarding/ExistingWeeklyReportPanel", () => ({
  default: () => <div>Existing report panel</div>,
}));
vi.mock("@/components/Onboarding/SetupSkipLink", () => ({
  default: () => null,
}));

afterEach(() => cleanup());

describe("FirstTaskStep", () => {
  beforeEach(() => {
    tasksQuery = { isLoading: false, data: [] };
  });

  it("shows the existing schedule when the account already had one on arrival", () => {
    tasksQuery = { isLoading: false, data: [{ id: "t-1", enabled: true }] };
    render(<FirstTaskStep />);
    expect(screen.getByText("Existing report panel")).toBeTruthy();
  });

  // The task is now created automatically when the first report finishes; the
  // tasks refetch must not swap the report the user is reading for the panel.
  it("keeps the first report on screen after its task is created", () => {
    const { rerender } = render(<FirstTaskStep />);
    expect(screen.getByText("First report run")).toBeTruthy();

    tasksQuery = { isLoading: false, data: [{ id: "t-new", enabled: true }] };
    rerender(<FirstTaskStep />);
    expect(screen.getByText("First report run")).toBeTruthy();
    expect(screen.queryByText("Existing report panel")).toBeNull();
  });

  it("describes a monthly report", () => {
    render(<FirstTaskStep />);
    expect(
      screen.getByRole("heading", { name: /your first monthly report/i }),
    ).toBeTruthy();
    expect(screen.queryByText(/monday|weekly/i)).toBeNull();
  });
});
