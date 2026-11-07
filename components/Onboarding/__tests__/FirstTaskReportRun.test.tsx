// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import FirstTaskReportRun from "@/components/Onboarding/FirstTaskReportRun";

vi.mock("@/hooks/useFirstTaskReport", () => ({
  useFirstTaskReport: () => ({
    messages: [],
    status: "ready",
    phase: "generating",
  }),
}));
vi.mock("@/components/VercelChat/message", () => ({ default: () => null }));
vi.mock("@/components/Onboarding/FirstTaskConfirm", () => ({
  default: () => null,
}));

afterEach(() => cleanup());

// The label follows the run's own decision, not the live value.
const renderRun = (willSchedule: boolean) =>
  render(
    <FirstTaskReportRun
      sessionId="s-1"
      chatId="c-1"
      prompt="p"
      willSchedule={willSchedule}
      autoCreate={!willSchedule}
    />,
  );

// The section's accessible name follows the visible heading.
describe("FirstTaskReportRun", () => {
  it("is labelled as the first monthly report when it will schedule one", () => {
    renderRun(true);
    expect(
      screen.getByRole("region", { name: /your first monthly report/i }),
    ).toBeTruthy();
  });

  it("is labelled as a catalog report when it only offers a schedule", () => {
    renderRun(false);
    expect(
      screen.getByRole("region", { name: /^catalog report$/i }),
    ).toBeTruthy();
  });
});
