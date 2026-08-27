// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UsagePage from "@/components/UsagePage/UsagePage";
import useAccountUsage from "@/hooks/useAccountUsage";

vi.mock("@/hooks/useAccountUsage", () => ({ default: vi.fn() }));

const EVENT = {
  id: "3AANn3Ij9uF-zZIlW_zlP",
  created_at: "2026-08-27T11:56:58.000Z",
  source: "api",
  agent_type: "main",
  provider: "fal",
  model_id: "minimax/music-3",
  input_tokens: 0,
  cached_input_tokens: 0,
  output_tokens: 0,
  tool_call_count: 0,
  credits_deducted: 20000,
  usd: "$0.02",
};
const CHAT_EVENT = {
  ...EVENT,
  id: "chat-1",
  created_at: "2026-08-26T09:00:00.000Z",
  source: "chat",
  provider: "openai",
  model_id: "gpt-5",
  input_tokens: 1200,
  output_tokens: 300,
  credits_deducted: 12345,
  usd: "$0.01",
};
const page = (events: (typeof EVENT)[], next_cursor: string | null = null) => ({
  account_id: "acct",
  period: { from: "2026-08-01T00:00:00.000Z", to: "2026-08-27T12:00:00.000Z" },
  total_credits_deducted: 32345,
  total_usd: "$0.03",
  events,
  next_cursor,
});
const mock = (v: Record<string, unknown>) =>
  vi.mocked(useAccountUsage).mockReturnValue(v as never);
const loaded = (pages: unknown[], extra: Record<string, unknown> = {}) =>
  mock({
    data: { pages },
    isLoading: false,
    error: null,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
    ...extra,
  });

describe("UsagePage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists each charge with its cost in dollars and never the raw credit integer", () => {
    loaded([page([EVENT, CHAT_EVENT])]);

    render(<UsagePage />);

    expect(screen.getByText("$0.02")).toBeDefined();
    expect(screen.getByText("fal / minimax/music-3")).toBeDefined();
    expect(screen.getByText("1,200 in · 300 out")).toBeDefined();
    expect(screen.queryByText(/20000/)).toBeNull();
    expect(screen.queryByText(/12345/)).toBeNull();
  });

  it("shows the period and its total as currency", () => {
    loaded([page([EVENT])]);

    render(<UsagePage />);

    expect(screen.getByText("$0.03")).toBeDefined();
    expect(screen.getByText(/Aug 1, 2026/)).toBeDefined();
    expect(screen.queryByText(/32345/)).toBeNull();
  });

  it("shows an empty state when nothing was charged in the period", () => {
    loaded([page([])]);

    render(<UsagePage />);

    expect(screen.getByText("No charges this period yet.")).toBeDefined();
  });

  it("explains a 403 instead of failing", () => {
    mock({
      data: undefined,
      isLoading: false,
      error: Object.assign(new Error("forbidden"), { status: 403 }),
    });

    render(<UsagePage />);

    expect(
      screen.getByText("You do not have access to this account's usage."),
    ).toBeDefined();
  });

  it("shows a skeleton while loading", () => {
    mock({ data: undefined, isLoading: true, error: null });

    const { container } = render(<UsagePage />);

    expect(container.querySelector(".animate-pulse")).not.toBeNull();
  });

  it("offers Load more only while a next cursor exists, and asks for the next page", () => {
    const fetchNextPage = vi.fn();
    loaded([page([EVENT], "2026-08-27T11:56:58.000Z")], {
      hasNextPage: true,
      fetchNextPage,
    });

    render(<UsagePage />);

    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("renders every loaded page in one list", () => {
    loaded([page([EVENT], "c1"), page([CHAT_EVENT])]);

    render(<UsagePage />);

    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.queryByRole("button", { name: "Load more" })).toBeNull();
  });
});
