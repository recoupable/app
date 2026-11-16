// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import FirstTaskScheduled from "@/components/Onboarding/FirstTaskScheduled";
import type { Task } from "@/lib/tasks/getTasks";

vi.mock("@/lib/tasks/getTaskNextRun", () => ({ getTaskNextRun: () => null }));

afterEach(() => cleanup());

describe("FirstTaskScheduled", () => {
  // Without a computed next run, describe the stored schedule, not one
  // rebuilt from the local clock.
  it("falls back to the task's own schedule for the next run", () => {
    render(
      <FirstTaskScheduled
        task={{ id: "t", schedule: "20 15 14 * *" } as Task}
        onTurnOff={() => {}}
        isTurningOff={false}
      />,
    );
    expect(
      screen.getByText(/at 03:20 pm, on day 14 of the month/i),
    ).toBeTruthy();
  });
});
