// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RunPage from "@/components/TasksPage/Run/RunPage";

const runQuery: {
  data: { status: string } | undefined;
  isPending: boolean;
  isLoading: boolean;
  error: Error | null;
} = { data: undefined, isPending: true, isLoading: false, error: null };
vi.mock("@/hooks/useTaskRunStatus", () => ({
  useTaskRunStatus: () => runQuery,
}));
vi.mock("@/components/TasksPage/Run/RunBreadcrumb", () => ({
  default: () => <nav>crumb</nav>,
}));
vi.mock("@/components/TasksPage/Run/RunPageSkeleton", () => ({
  default: () => <div data-testid="skeleton" />,
}));
vi.mock("@/components/TasksPage/Run/RunDetails", () => ({
  default: ({ data }: { data: { status: string } }) => <p>{data.status}</p>,
}));

describe("RunPage", () => {
  beforeEach(() => {
    Object.assign(runQuery, {
      data: undefined,
      isPending: true,
      isLoading: false,
      error: null,
    });
  });

  it("shows the skeleton while the query is pending but not yet fetching (app#2016 item 4)", () => {
    render(<RunPage runId="run-a" />);
    expect(screen.getByTestId("skeleton")).toBeTruthy();
  });

  it("shows the error once the query fails instead of staying on the skeleton", () => {
    Object.assign(runQuery, { isPending: false, error: new Error("HTTP 404") });
    render(<RunPage runId="run-a" />);
    expect(screen.queryByTestId("skeleton")).toBeNull();
    expect(screen.getByText("HTTP 404")).toBeTruthy();
  });

  it("renders the run once data arrives", () => {
    Object.assign(runQuery, {
      isPending: false,
      data: { status: "COMPLETED" },
    });
    render(<RunPage runId="run-a" />);
    expect(screen.getByText("COMPLETED")).toBeTruthy();
  });
});
