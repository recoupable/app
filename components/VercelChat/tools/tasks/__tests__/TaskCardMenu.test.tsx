// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TaskCard, { type TaskCardProps } from "../TaskCard";
import { forbidTaskNetwork } from "./forbidTaskNetwork";

const actions = vi.hoisted(() => ({
  update: vi.fn(),
  remove: vi.fn(),
  updating: false,
  deleting: false,
}));
vi.mock("@/hooks/useArtistImage", () => ({
  default: () => ({ imageUrl: null, artistName: null }),
}));
vi.mock("@/hooks/useUpdateScheduledAction", () => ({
  useUpdateScheduledAction: () => ({
    updateAction: actions.update,
    isLoading: actions.updating,
  }),
}));
vi.mock("@/hooks/useDeleteScheduledAction", () => ({
  useDeleteScheduledAction: () => ({
    deleteAction: actions.remove,
    isLoading: actions.deleting,
  }),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
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
} satisfies TaskCardProps["task"];
forbidTaskNetwork();
beforeEach(() => {
  actions.update.mockReset().mockResolvedValue(undefined);
  actions.remove.mockReset().mockResolvedValue(undefined);
  actions.updating = actions.deleting = false;
});

describe("task card menu ownership", () => {
  it("keeps task navigation separate from the named semantic menu", () => {
    render(
      <TaskCard
        task={task}
        ownerEmail="owner@example.test"
        artistName="Synthetic artist"
      />,
    );
    const button = screen.getByRole("button", {
      name: "Task options for Weekly report",
    });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.tabIndex).toBe(0);
    expect(button.closest("a")).toBeNull();
    expect(screen.getByRole("link").getAttribute("href")).toBe("/tasks/task-a");
    expect(screen.getByText("owner@example.test")).toBeTruthy();
    expect(screen.getByText("Synthetic artist")).toBeTruthy();
    expect(screen.getByText("Active")).toBeTruthy();
  });

  it.each(["Enter", " "])(
    "opens with %s and dismisses without mutation",
    async (key) => {
      render(<TaskCard task={task} />);
      const button = screen.getByRole("button", {
        name: "Task options for Weekly report",
      });
      button.focus();
      fireEvent.keyDown(button, { key });
      const menu = await screen.findByRole("menu");
      expect(screen.getByText("Active")).toBeTruthy();
      fireEvent.keyDown(menu, { key: "Escape" });
      await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
      await waitFor(() => expect(document.activeElement).toBe(button));
      expect(actions.update).not.toHaveBeenCalled();
      expect(actions.remove).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it("keeps deleted results static with no menu or route", () => {
    const { container } = render(<TaskCard task={task} isDeleted />);
    expect(screen.getByText("Deleted")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.querySelector("[aria-haspopup='menu']")).toBeNull();
  });

  it("disables redundant Pause for an already paused task", async () => {
    render(<TaskCard task={{ ...task, enabled: false }} />);
    fireEvent.keyDown(screen.getByRole("button", { name: /Task options/ }), {
      key: "Enter",
    });
    await screen.findByRole("menu");
    expect(
      screen
        .getByRole("menuitem", { name: "Pause" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
    expect(screen.getByText("Paused")).toBeTruthy();
    fireEvent.click(screen.getByRole("menuitem", { name: "Pause" }));
    expect(actions.update).not.toHaveBeenCalled();
  });

  it.each(["updating", "deleting"] as const)(
    "disables actions while %s",
    async (pending) => {
      actions[pending] = true;
      render(<TaskCard task={task} />);
      fireEvent.keyDown(screen.getByRole("button", { name: /Task options/ }), {
        key: "Enter",
      });
      await screen.findByRole("menu");
      expect(
        screen
          .getByRole("menuitem", { name: /Paus/ })
          .getAttribute("aria-disabled"),
      ).toBe("true");
      expect(
        screen
          .getByRole("menuitem", { name: /Delet/ })
          .getAttribute("aria-disabled"),
      ).toBe("true");
    },
  );

  it.each(["Pause", "Delete"])(
    "preserves the %s callback payload with isolated hooks",
    async (action) => {
      render(<TaskCard task={task} />);
      fireEvent.keyDown(screen.getByRole("button", { name: /Task options/ }), {
        key: "Enter",
      });
      const item = await screen.findByRole("menuitem", { name: action });
      fireEvent.click(item);
      await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
      if (action === "Pause") {
        expect(actions.update).toHaveBeenCalledExactlyOnceWith({
          updates: { id: "task-a", enabled: false },
          successMessage: "Task paused successfully",
        });
        expect(actions.remove).not.toHaveBeenCalled();
      } else {
        expect(actions.remove).toHaveBeenCalledExactlyOnceWith({
          actionId: "task-a",
          successMessage: "Task deleted successfully",
        });
        expect(actions.update).not.toHaveBeenCalled();
      }
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it("keeps a failed action available for retry", async () => {
    actions.update.mockRejectedValueOnce(new Error("synthetic failure"));
    render(<TaskCard task={task} />);
    fireEvent.keyDown(screen.getByRole("button", { name: /Task options/ }), {
      key: "Enter",
    });
    fireEvent.click(await screen.findByRole("menuitem", { name: "Pause" }));
    await waitFor(() => expect(actions.update).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("menu")).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });
});
