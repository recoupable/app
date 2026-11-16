// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FirstTaskReport from "@/components/Onboarding/FirstTaskReport";

let chatId = "chat-1";
const runProps = vi.fn();

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
  useNewChatBootstrap: () => ({ status: "ready", chatId, sessionId: "s-1" }),
}));
vi.mock("@/components/Onboarding/FirstTaskReportRun", () => ({
  default: (props: { autoCreate: boolean; willSchedule: boolean }) => {
    runProps(props);
    return <div>First report run</div>;
  },
}));
vi.mock("@/components/Onboarding/SetupSkipLink", () => ({
  default: () => null,
}));

afterEach(() => cleanup());

const heading = (name: RegExp) => screen.getByRole("heading", { name });

describe("FirstTaskReport", () => {
  beforeEach(() => {
    chatId = "chat-1";
    runProps.mockClear();
  });

  it("describes the monthly report it is about to schedule", () => {
    render(<FirstTaskReport autoCreate />);
    expect(heading(/your first monthly report/i)).toBeTruthy();
    expect(screen.getByText(/every month/i)).toBeTruthy();
    expect(screen.queryByText(/monday|weekly/i)).toBeNull();
  });

  // With an active report already, the step only offers a schedule, so the
  // copy must not promise one.
  it("promises no schedule when it will only offer one", () => {
    render(<FirstTaskReport autoCreate={false} />);
    expect(heading(/catalog report for luh tyler/i)).toBeTruthy();
    expect(screen.queryByText(/will email you/i)).toBeNull();
  });

  // The automatic create refetches tasks and flips autoCreate to false; the
  // report on screen keeps its heading and its schedule step.
  it("keeps the monthly framing after its own task is created", () => {
    const { rerender } = render(<FirstTaskReport autoCreate />);
    rerender(<FirstTaskReport autoCreate={false} />);
    expect(heading(/your first monthly report/i)).toBeTruthy();
    // The label keeps the run's decision; the schedule step gets the live
    // value and fixes its own choice when it appears.
    expect(runProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ willSchedule: true, autoCreate: false }),
    );
  });

  it("decides again for a new report run, such as another artist", () => {
    const { rerender } = render(<FirstTaskReport autoCreate />);
    chatId = "chat-2";
    rerender(<FirstTaskReport autoCreate={false} />);
    expect(heading(/catalog report for luh tyler/i)).toBeTruthy();
    expect(runProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ willSchedule: false, autoCreate: false }),
    );
  });
});
