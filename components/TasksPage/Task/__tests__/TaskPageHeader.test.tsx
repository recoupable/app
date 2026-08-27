// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TaskPageHeader from "@/components/TasksPage/Task/TaskPageHeader";
import type { Task } from "@/lib/tasks/getTasks";

vi.mock("@/components/ArtistSetting/AccountIdDisplay", () => ({
  default: () => null,
}));
vi.mock("@/lib/utils/formatScheduledActionDate", () => ({
  formatScheduledActionDate: (d: string | null) => (d ? `fmt(${d})` : "Never"),
}));

const base = {
  id: "task-a",
  title: "Weekly report",
  prompt: "p",
  schedule: "0 15 * * 1",
  enabled: true,
} as unknown as Task;

const header = (overrides: Partial<Task>) =>
  render(<TaskPageHeader task={{ ...base, ...overrides }} />);
/** The whole "Label: value" row for a header line. */
const row = (label: string) =>
  screen.getByText(label).closest("div")?.textContent ?? "";

describe("TaskPageHeader last / next run (app#2016 item 1)", () => {
  it("shows the last run and next run for a live task", () => {
    header({
      recent_runs: [{ id: "r1", createdAt: "2026-08-24T15:00:00Z" }] as never,
      upcoming: ["2026-08-31T15:00:00Z"],
    });
    expect(row("Last run:")).toContain("fmt(2026-08-24T15:00:00Z)");
    expect(row("Next run:")).toContain("fmt(2026-08-31T15:00:00Z)");
  });

  it("says Never run and Paused, no upcoming runs for a paused task that never ran", () => {
    header({ enabled: false, recent_runs: [], upcoming: [] });
    expect(row("Last run:")).toContain("Never run");
    expect(row("Next run:")).toContain("Paused, no upcoming runs");
  });

  it("says Not scheduled for an enabled task with no upcoming runs and a successful lookup", () => {
    header({
      enabled: true,
      recent_runs: [],
      upcoming: [],
      trigger_lookup_failed: false,
    });
    expect(row("Next run:")).toContain("Not scheduled");
  });

  it("says Schedule unavailable when the Trigger lookup failed, instead of claiming there is no schedule", () => {
    header({
      enabled: true,
      recent_runs: [],
      upcoming: [],
      trigger_lookup_failed: true,
    });
    expect(row("Next run:")).toContain("Schedule unavailable");
    expect(screen.queryByText(/Not scheduled/)).toBeNull();
  });

  it("still renders both lines when the API omits the run fields entirely", () => {
    header({});
    expect(row("Last run:")).toContain("Never run");
    expect(row("Next run:")).toContain("Not scheduled");
  });
});
