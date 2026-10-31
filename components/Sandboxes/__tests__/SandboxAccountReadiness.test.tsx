// @vitest-environment jsdom
import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import SandboxFileTree from "../SandboxFileTree";
import AccountOverrideBadge from "@/components/AccountOverrideBadge";
import { AccountOverrideProvider } from "@/providers/AccountOverrideProvider";
import { fetchAccountIdByEmail } from "@/lib/accounts/fetchAccountIdByEmail";

vi.mock("next/navigation", () => ({
  useSearchParams: () =>
    new URLSearchParams({ email: "selected@example.test" }),
  useRouter: () => ({ replace: vi.fn() }),
}));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    user: { id: "actor-a" },
    authenticated: true,
    getAccessToken: async () => "synthetic-token",
  }),
}));
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => "https://api.example.test",
}));
vi.mock("@/lib/accounts/fetchAccountIdByEmail", () => ({
  fetchAccountIdByEmail: vi.fn(),
}));
const fetchMock = vi.fn();
let client: QueryClient;
function renderFiles() {
  return render(
    <QueryClientProvider client={client}>
      <AccountOverrideProvider>
        <AccountOverrideBadge />
        <SandboxFileTree />
      </AccountOverrideProvider>
    </QueryClientProvider>,
  );
}
function expectUnresolvedFiles() {
  expect(screen.getByText(/selected account is not ready/i)).toBeDefined();
  expect(screen.getByText(/clear.*account.*above/i)).toBeDefined();
  expect(screen.queryByText(/No files yet/)).toBeNull();
  expect(screen.queryByText("Loading files...")).toBeNull();
  expect(
    screen.getByRole("button", { name: "Clear account override" }),
  ).toBeDefined();
  expect(fetchMock).not.toHaveBeenCalled();
}
beforeEach(() => {
  window.sessionStorage.clear();
  vi.mocked(fetchAccountIdByEmail).mockReset();
  fetchMock.mockReset().mockImplementation(async (url: string) => {
    const request = new URL(url);
    if (request.pathname !== "/api/sandboxes")
      throw new Error("Unexpected request");
    return {
      ok: true,
      json: async () => ({
        status: "success",
        account_id: request.searchParams.get("account_id"),
        sandboxes: [],
        filetree: [],
      }),
    };
  });
  vi.stubGlobal("fetch", fetchMock);
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => {
  cleanup();
  client.clear();
  window.sessionStorage.clear();
  vi.unstubAllGlobals();
});

it("does not label a pending account as empty and returns to default only on clear", async () => {
  let release!: (value: string) => void;
  vi.mocked(fetchAccountIdByEmail).mockReturnValueOnce(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  renderFiles();
  await waitFor(() => expect(fetchAccountIdByEmail).toHaveBeenCalledTimes(1));
  expectUnresolvedFiles();
  fireEvent.click(
    screen.getByRole("button", { name: "Clear account override" }),
  );
  await waitFor(() => expect(screen.getByText(/No files yet/)).toBeDefined());
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(
    new URL(fetchMock.mock.calls[0][0]).searchParams.has("account_id"),
  ).toBe(false);
  await act(async () => release("selected-account"));
  expect(screen.queryByText(/selected account is not ready/i)).toBeNull();
});

it.each(["missing", "failed"])(
  "distinguishes a %s account lookup from a settled empty account",
  async (kind) => {
    if (kind === "missing")
      vi.mocked(fetchAccountIdByEmail).mockResolvedValue(null);
    else
      vi.mocked(fetchAccountIdByEmail).mockRejectedValue(
        new Error("Account lookup failed"),
      );
    renderFiles();
    await waitFor(() => expect(client.isFetching()).toBe(0));
    expectUnresolvedFiles();
  },
);

it("shows the real empty state after the selected account is resolved and its list loads", async () => {
  vi.mocked(fetchAccountIdByEmail).mockResolvedValue("selected-account");
  renderFiles();
  await waitFor(() => expect(screen.getByText("No files yet.")).toBeDefined());
  expect(screen.queryByText(/selected account is not ready/i)).toBeNull();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(
    new URL(fetchMock.mock.calls[0][0]).searchParams.get("account_id"),
  ).toBe("selected-account");
});
