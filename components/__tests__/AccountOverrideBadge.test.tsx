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
import AccountOverrideBadge from "../AccountOverrideBadge";
import { AccountOverrideProvider } from "@/providers/AccountOverrideProvider";
import { useSandboxAccountScope } from "@/hooks/useSandboxAccountScope";
import { fetchAccountIdByEmail } from "@/lib/accounts/fetchAccountIdByEmail";
import { getStoredAccountOverride } from "@/lib/accounts/override/getStoredAccountOverride";
import { setStoredAccountOverride } from "@/lib/accounts/override/setStoredAccountOverride";

const state = vi.hoisted(() => ({
  email: "selected@example.test" as string | null,
}));
const token = vi.hoisted(() =>
  vi.fn(async (): Promise<string | null> => "synthetic-token"),
);
const replace = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  useSearchParams: () =>
    new URLSearchParams(state.email ? { email: state.email } : {}),
  useRouter: () => ({ replace }),
}));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    user: { id: "actor-a" },
    authenticated: true,
    getAccessToken: token,
  }),
}));
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => "https://api.example.test",
}));
vi.mock("@/lib/accounts/fetchAccountIdByEmail", () => ({
  fetchAccountIdByEmail: vi.fn(),
}));

let client: QueryClient;
function ScopeStatus() {
  const { ready, accountId } = useSandboxAccountScope();
  return (
    <button disabled={!ready}>
      {accountId ? "Selected files ready" : "Default files ready"}
    </button>
  );
}
function renderSelection() {
  return render(
    <QueryClientProvider client={client}>
      <AccountOverrideProvider>
        <AccountOverrideBadge />
        <ScopeStatus />
      </AccountOverrideProvider>
    </QueryClientProvider>,
  );
}
function expectBlockedSelection() {
  expect(screen.getByText("selected@example.test")).toBeDefined();
  expect(screen.getByText("Selected account")).toBeDefined();
  expect(screen.queryByText("Viewing as")).toBeNull();
  expect(
    (
      screen.getByRole("button", {
        name: "Default files ready",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  expect(
    screen.getByRole("button", { name: "Clear account override" }),
  ).toBeDefined();
}
function clearAndExpectDefault() {
  fireEvent.click(
    screen.getByRole("button", { name: "Clear account override" }),
  );
  expect(
    screen.queryByRole("button", { name: "Clear account override" }),
  ).toBeNull();
  expect(
    (
      screen.getByRole("button", {
        name: "Default files ready",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(false);
  expect(getStoredAccountOverride()).toEqual({ accountId: null, email: null });
  expect(replace).toHaveBeenCalledWith(window.location.pathname);
}

beforeEach(() => {
  state.email = "selected@example.test";
  window.sessionStorage.clear();
  token.mockReset().mockResolvedValue("synthetic-token");
  replace.mockReset();
  vi.mocked(fetchAccountIdByEmail).mockReset();
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => {
  cleanup();
  client.clear();
  window.sessionStorage.clear();
});

it("allows clearing a pending selection and does not revive it after the lookup finishes", async () => {
  let release!: (account: string) => void;
  vi.mocked(fetchAccountIdByEmail).mockReturnValue(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  renderSelection();
  await waitFor(() => expect(fetchAccountIdByEmail).toHaveBeenCalledTimes(1));
  expectBlockedSelection();
  clearAndExpectDefault();
  await act(async () => release("selected-account"));
  expect(screen.queryByText("selected@example.test")).toBeNull();
  expect(getStoredAccountOverride().accountId).toBeNull();
  expect(
    (
      screen.getByRole("button", {
        name: "Default files ready",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(false);
});

it("keeps an unresolved persisted selection blocked until the user clears it", async () => {
  state.email = null;
  setStoredAccountOverride("old-account", "selected@example.test");
  vi.mocked(fetchAccountIdByEmail).mockResolvedValue(null);
  renderSelection();
  await waitFor(() => expect(client.isFetching()).toBe(0));
  expect(fetchAccountIdByEmail).toHaveBeenCalledTimes(1);
  expectBlockedSelection();
  clearAndExpectDefault();
});

it("offers explicit recovery when the account lookup rejects", async () => {
  vi.mocked(fetchAccountIdByEmail).mockRejectedValue(
    new Error("Account lookup failed: 403"),
  );
  renderSelection();
  await waitFor(() => expect(client.isFetching()).toBe(0));
  expect(fetchAccountIdByEmail).toHaveBeenCalledTimes(1);
  expectBlockedSelection();
  clearAndExpectDefault();
});

it("offers explicit recovery when no access token is available", async () => {
  token.mockResolvedValue(null);
  renderSelection();
  await waitFor(() => expect(client.isFetching()).toBe(0));
  expect(token).toHaveBeenCalled();
  expect(fetchAccountIdByEmail).not.toHaveBeenCalled();
  expectBlockedSelection();
  clearAndExpectDefault();
});

it("preserves the resolved badge and its clear action", async () => {
  vi.mocked(fetchAccountIdByEmail).mockResolvedValue("selected-account");
  renderSelection();
  await waitFor(() => expect(screen.getByText("Viewing as")).toBeDefined());
  expect(screen.getByText("selected@example.test")).toBeDefined();
  expect(
    (
      screen.getByRole("button", {
        name: "Selected files ready",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(false);
  clearAndExpectDefault();
});

it("does not show an override badge for the default account", () => {
  state.email = null;
  renderSelection();
  expect(
    screen.queryByRole("button", { name: "Clear account override" }),
  ).toBeNull();
  expect(
    (
      screen.getByRole("button", {
        name: "Default files ready",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(false);
  expect(fetchAccountIdByEmail).not.toHaveBeenCalled();
});
