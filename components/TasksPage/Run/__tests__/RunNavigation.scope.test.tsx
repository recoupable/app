// @vitest-environment jsdom
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import {
  context,
  fetchMock,
  wrapper,
  response,
} from "@/hooks/__tests__/taskRunScope.fixture";
import RecentRunsList from "@/components/TasksPage/RecentRunsList";
import RunPage from "../RunPage";
import RunDetails from "../RunDetails";
import HomeRunRow from "@/components/Home/HomeRunRow";
import type { TaskRunItem } from "@/lib/tasks/getTaskRuns";
import type { TaskRunStatus } from "@/lib/tasks/getTaskRunStatus";
const route = vi.hoisted(() => ({ query: "account_id=target-b" }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(route.query),
}));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
const run = {
  id: "run-a",
  status: "COMPLETED",
  taskIdentifier: "scheduled-task",
  createdAt: "2026-10-25T12:00:00Z",
  startedAt: null,
  finishedAt: null,
  durationMs: null,
} satisfies TaskRunItem;
const detail = {
  ...run,
  metadata: {
    workflowRunId: "workflow-a",
    sessionId: "session-a",
    chatId: "chat-a",
  },
} satisfies TaskRunStatus;

it("retains the list target through detail and the back link despite a conflicting global selection", async () => {
  context.account = "global-c";
  const list = render(
    <RecentRunsList
      runs={[run]}
      accountId="target-b"
      isLoading={false}
      isError={false}
    />,
  );
  const href = screen.getByRole("link").getAttribute("href")!;
  expect(href).toBe("/runs/run-a?account_id=target-b");
  route.query = href.split("?")[1];
  list.unmount();
  fetchMock.mockResolvedValue(response());
  render(<RunPage runId="run-a" />, { wrapper });
  await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  expect(
    new URL(fetchMock.mock.calls[0][0]).searchParams.get("account_id"),
  ).toBe("target-b");
  expect(screen.getByRole("link", { name: "Tasks" }).getAttribute("href")).toBe(
    "/tasks?tab=recents&account_id=target-b",
  );
  expect(screen.getByText(/Runs for account target-b/).textContent).toContain(
    "takes precedence",
  );
});
it("homepage run rows preserve the fetched target", () => {
  render(<HomeRunRow run={run} accountId="target-b" />);
  expect(screen.getByRole("link").getAttribute("href")).toBe(
    "/runs/run-a?account_id=target-b",
  );
});
it("unresolved detail selection is not an infinite skeleton or empty history", () => {
  route.query = "";
  context.email = "pending@example.test";
  render(<RunPage runId="run-a" />, { wrapper });
  expect(screen.getByRole("status").textContent).toContain("resolve or clear");
  expect(fetchMock).not.toHaveBeenCalled();
});
it.each(["self", "matching", "conflicting", "unresolved"] as const)(
  "keeps workflow metadata but opens chat only with a %s compatible selection",
  async (mode) => {
    context.account =
      mode === "matching"
        ? "target-b"
        : mode === "conflicting"
          ? "global-c"
          : null;
    context.email = mode === "unresolved" ? "pending@example.test" : null;
    const accountId = mode === "self" ? undefined : "target-b";
    render(<RunDetails runId="run-a" data={detail} accountId={accountId} />, {
      wrapper,
    });
    await waitFor(() => expect(screen.getByText("Completed")).toBeTruthy());
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/api/chat/runs/workflow-a",
    );
    if (mode === "self" || mode === "matching")
      expect(
        screen.getByRole("link", { name: "Open chat" }).getAttribute("href"),
      ).toBe("/sessions/session-a/chats/chat-a");
    else {
      expect(screen.queryByRole("link", { name: "Open chat" })).toBeNull();
      expect(
        screen.getByText(/Select the matching workspace account/),
      ).toBeTruthy();
    }
  },
);
