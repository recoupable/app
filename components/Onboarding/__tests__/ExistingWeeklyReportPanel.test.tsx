// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ExistingWeeklyReportPanel from "@/components/Onboarding/ExistingWeeklyReportPanel";
import type { Task } from "@/lib/tasks/getTasks";

afterEach(() => cleanup());

describe("ExistingWeeklyReportPanel", () => {
  it("says the report is set up when it is on", () => {
    render(
      <ExistingWeeklyReportPanel task={{ id: "t", enabled: true } as Task} />,
    );
    expect(
      screen.getByRole("heading", { name: /already set up/i }),
    ).toBeTruthy();
  });

  it("says the report is turned off when it was paused", () => {
    render(
      <ExistingWeeklyReportPanel task={{ id: "t", enabled: false } as Task} />,
    );
    expect(screen.getByRole("heading", { name: /turned off/i })).toBeTruthy();
    expect(screen.getByText(/turn it back on/i)).toBeTruthy();
  });
});
