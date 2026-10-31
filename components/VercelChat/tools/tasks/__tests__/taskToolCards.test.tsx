// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GetTasksSuccess from "@/components/VercelChat/tools/tasks/GetTasksSuccess";
import CreateTaskSuccess from "@/components/VercelChat/tools/tasks/CreateTaskSuccess";
import UpdateTaskSuccess from "@/components/VercelChat/tools/tasks/UpdateTaskSuccess";
import DeleteTaskSuccess from "@/components/VercelChat/tools/tasks/DeleteTaskSuccess";
import type { ScheduledAction } from "@/components/VercelChat/types";
import { forbidTaskNetwork } from "./forbidTaskNetwork";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: React.ComponentProps<"a"> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/hooks/useArtistImage", () => ({
  default: () => ({ imageUrl: null, artistName: null }),
}));
vi.mock("@/hooks/useUpdateScheduledAction", () => ({
  useUpdateScheduledAction: () => ({ updateAction: vi.fn(), isLoading: false }),
}));
vi.mock("@/hooks/useDeleteScheduledAction", () => ({
  useDeleteScheduledAction: () => ({ deleteAction: vi.fn(), isLoading: false }),
}));

const task = {
  id: "task-a",
  title: "Weekly report",
  schedule: "0 9 * * *",
  enabled: true,
  artist_account_id: "",
  account_id: "synthetic-account",
  created_at: null,
  updated_at: null,
  model: null,
  prompt: "Synthetic report instructions",
  trigger_schedule_id: null,
} satisfies ScheduledAction;

forbidTaskNetwork();

describe("task tool cards (chat#2006 item 8)", () => {
  it.each([
    { tool: "get_tasks", card: <GetTasksSuccess result={[task]} /> },
    { tool: "create_task", card: <CreateTaskSuccess result={task} /> },
    { tool: "update_task", card: <UpdateTaskSuccess result={task} /> },
  ])(
    "$tool keeps its menu separate and preserves task metadata",
    ({ card }) => {
      render(card);
      const link = screen.getByRole("link");
      const menu = screen.getByRole("button", {
        name: "Task options for Weekly report",
      });
      expect(link.getAttribute("href")).toBe("/tasks/task-a");
      expect(menu.closest("a")).toBeNull();
      expect(menu.parentElement).toBe(link.parentElement);
      expect(
        link.querySelector(
          "a, button, input, select, textarea, [role='button'], [tabindex], [aria-haspopup]",
        ),
      ).toBeNull();
      expect(link.textContent).toContain("Weekly report");
      expect(link.textContent).toContain("At 09:00 AM");
      expect(link.textContent).toContain("Active");
    },
  );

  it("a deleted task card has no link, since its page no longer exists", () => {
    const { container } = render(<DeleteTaskSuccess result={task} />);
    expect(screen.getByText("Weekly report")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.querySelector("[aria-haspopup='menu']")).toBeNull();
    expect(screen.getByText("At 09:00 AM")).toBeTruthy();
    expect(screen.getByText("Deleted")).toBeTruthy();
  });
});
