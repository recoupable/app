// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TasksList from "@/components/TasksPage/TasksList";
import type { Task } from "@/lib/tasks/getTasks";
import { forbidTaskNetwork } from "@/components/VercelChat/tools/tasks/__tests__/forbidTaskNetwork";

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

vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: "acct-test" } }),
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

const task = (id: string, title: string): Task => ({
  id,
  title,
  schedule: "0 9 * * *",
  enabled: true,
  artist_account_id: "",
  account_id: "synthetic-account",
  created_at: null,
  updated_at: null,
  model: null,
  prompt: "Synthetic report instructions",
  trigger_schedule_id: null,
  owner_email: `${id}@example.test`,
  artist_name: `Artist for ${title}`,
});

forbidTaskNetwork();

describe("TasksList", () => {
  it("links every row to its task page instead of opening a popup", () => {
    const tasks = [
      task("task-a", "Weekly report"),
      task("task-b", "Daily brief"),
    ];
    render(<TasksList tasks={tasks} isLoading={false} isError={false} />);

    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "/tasks/task-a",
      "/tasks/task-b",
    ]);
    expect(screen.queryByRole("dialog")).toBeNull();
    for (const task of tasks) {
      const link = screen.getByRole("link", { name: new RegExp(task.title) });
      const menu = screen.getByRole("button", {
        name: `Task options for ${task.title}`,
      });
      expect(link.getAttribute("href")).toBe(`/tasks/${task.id}`);
      expect(menu.closest("a")).toBeNull();
      expect(menu.parentElement).toBe(link.parentElement);
      expect(
        link.querySelector(
          "a, button, input, select, textarea, [role='button'], [tabindex], [aria-haspopup]",
        ),
      ).toBeNull();
      expect(link.textContent).toContain(task.title);
      expect(link.textContent).toContain(task.owner_email);
      expect(link.textContent).toContain(task.artist_name);
      expect(link.textContent).toContain("At 09:00 AM");
      expect(link.textContent).toContain("Active");
    }
  });
});
