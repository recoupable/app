// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import FirstTaskReport from "@/components/Onboarding/FirstTaskReport";

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
vi.mock("@/components/Onboarding/FirstTaskReportRun", () => ({
  default: () => <div>First report run</div>,
}));
vi.mock("@/components/Onboarding/SetupSkipLink", () => ({
  default: () => null,
}));

afterEach(() => cleanup());

describe("FirstTaskReport", () => {
  it("describes the monthly report it is about to schedule", () => {
    render(<FirstTaskReport autoCreate />);
    expect(
      screen.getByRole("heading", { name: /your first monthly report/i }),
    ).toBeTruthy();
    expect(screen.getByText(/every month/i)).toBeTruthy();
    expect(screen.queryByText(/monday|weekly/i)).toBeNull();
  });

  // With an active report already, the step only offers a schedule, so the
  // copy must not promise one.
  it("promises no schedule when it will only offer one", () => {
    render(<FirstTaskReport autoCreate={false} />);
    expect(
      screen.getByRole("heading", { name: /catalog report for luh tyler/i }),
    ).toBeTruthy();
    expect(screen.queryByText(/will email you/i)).toBeNull();
  });
});
