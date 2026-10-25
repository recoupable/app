// @vitest-environment jsdom
import React from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import {
  AccountOverrideProvider,
  useAccountOverride,
} from "../AccountOverrideProvider";
import { fetchAccountIdByEmail } from "@/lib/accounts/fetchAccountIdByEmail";
import { setStoredAccountOverride } from "@/lib/accounts/override/setStoredAccountOverride";
import { getStoredAccountOverride } from "@/lib/accounts/override/getStoredAccountOverride";

const state = vi.hoisted(() => ({
  email: "b@example.test" as string | null,
  actor: "actor-a",
  authenticated: true,
  origin: "https://api.example.test",
}));
const token = vi.hoisted(() => vi.fn(async () => "synthetic-token"));
const replace = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  useSearchParams: () =>
    new URLSearchParams(state.email ? { email: state.email } : {}),
  useRouter: () => ({ replace }),
}));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    user: { id: state.actor },
    authenticated: state.authenticated,
    getAccessToken: token,
  }),
}));
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => state.origin,
}));
vi.mock("@/lib/accounts/fetchAccountIdByEmail", () => ({
  fetchAccountIdByEmail: vi.fn(),
}));
let client: QueryClient;
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={client}>
    <AccountOverrideProvider>{children}</AccountOverrideProvider>
  </QueryClientProvider>
);
beforeEach(() => {
  state.email = "b@example.test";
  state.actor = "actor-a";
  state.authenticated = true;
  state.origin = "https://api.example.test";
  window.sessionStorage.clear();
  token.mockReset().mockResolvedValue("synthetic-token");
  replace.mockReset();
  vi.mocked(fetchAccountIdByEmail)
    .mockReset()
    .mockImplementation(async (email) =>
      email === "b@example.test" ? "account-b" : "account-c",
    );
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => {
  cleanup();
  client.clear();
  window.sessionStorage.clear();
});

it("resolves a new URL email instead of pairing it with the previously stored account", async () => {
  setStoredAccountOverride("account-b", "b@example.test");
  const { result, rerender } = renderHook(() => useAccountOverride(), {
    wrapper,
  });
  await waitFor(() =>
    expect(result.current.accountIdOverride).toBe("account-b"),
  );
  state.email = "c@example.test";
  rerender();
  expect(result.current.email).toBe("c@example.test");
  expect(result.current.accountIdOverride).toBeNull();
  await waitFor(() =>
    expect(result.current.accountIdOverride).toBe("account-c"),
  );
  expect(getStoredAccountOverride()).toEqual({
    accountId: "account-c",
    email: "c@example.test",
  });
});

it("never persists an obsolete lookup after selecting another email", async () => {
  let release!: (account: string) => void;
  vi.mocked(fetchAccountIdByEmail).mockReturnValueOnce(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  const { result, rerender } = renderHook(() => useAccountOverride(), {
    wrapper,
  });
  await waitFor(() => expect(fetchAccountIdByEmail).toHaveBeenCalledTimes(1));
  state.email = "c@example.test";
  rerender();
  await waitFor(() =>
    expect(result.current.accountIdOverride).toBe("account-c"),
  );
  await act(async () => release("account-b"));
  expect(result.current.accountIdOverride).toBe("account-c");
  expect(getStoredAccountOverride()).toEqual({
    accountId: "account-c",
    email: "c@example.test",
  });
});

it("restarts an abandoned lookup when returning to the same email before it finishes", async () => {
  let release!: (account: string) => void;
  vi.mocked(fetchAccountIdByEmail).mockReturnValueOnce(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  const { result, rerender } = renderHook(() => useAccountOverride(), {
    wrapper,
  });
  await waitFor(() => expect(fetchAccountIdByEmail).toHaveBeenCalledTimes(1));
  state.email = "c@example.test";
  rerender();
  await waitFor(() =>
    expect(result.current.accountIdOverride).toBe("account-c"),
  );
  state.email = "b@example.test";
  rerender();
  await waitFor(() =>
    expect(result.current.accountIdOverride).toBe("account-b"),
  );
  await act(async () => release("obsolete-b"));
  expect(result.current.accountIdOverride).toBe("account-b");
  expect(getStoredAccountOverride().accountId).toBe("account-b");
});

it.each(["actor", "origin"] as const)(
  "does not reuse account resolution across a different %s",
  async (field) => {
    const { result, rerender } = renderHook(() => useAccountOverride(), {
      wrapper,
    });
    await waitFor(() =>
      expect(result.current.accountIdOverride).toBe("account-b"),
    );
    vi.mocked(fetchAccountIdByEmail).mockResolvedValue(null);
    state[field] = field === "actor" ? "actor-b" : "https://other.example.test";
    rerender();
    expect(result.current.accountIdOverride).toBeNull();
    await waitFor(() => expect(fetchAccountIdByEmail).toHaveBeenCalledTimes(2));
    expect(result.current.accountIdOverride).toBeNull();
  },
);

it("hides the override on authentication loss and prevents late persistence", async () => {
  let release!: (account: string) => void;
  vi.mocked(fetchAccountIdByEmail).mockReturnValueOnce(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  const { result, rerender } = renderHook(() => useAccountOverride(), {
    wrapper,
  });
  await waitFor(() => expect(fetchAccountIdByEmail).toHaveBeenCalledTimes(1));
  state.authenticated = false;
  rerender();
  await act(async () => release("account-b"));
  expect(result.current.accountIdOverride).toBeNull();
  expect(getStoredAccountOverride().accountId).toBeNull();
});

it("clears a stored override through the URL and does not resurrect it on return to default", async () => {
  setStoredAccountOverride("account-b", "b@example.test");
  state.email = "clear";
  const { result, rerender } = renderHook(() => useAccountOverride(), {
    wrapper,
  });
  await waitFor(() => expect(getStoredAccountOverride().accountId).toBeNull());
  expect(result.current.accountIdOverride).toBeNull();
  state.email = null;
  rerender();
  expect(result.current.email).toBeNull();
  expect(result.current.accountIdOverride).toBeNull();
});

it("clears immediately and permits selecting the same email again later", async () => {
  const { result, rerender } = renderHook(() => useAccountOverride(), {
    wrapper,
  });
  await waitFor(() =>
    expect(result.current.accountIdOverride).toBe("account-b"),
  );
  act(() => result.current.clear());
  expect(result.current.accountIdOverride).toBeNull();
  expect(result.current.email).toBeNull();
  state.email = null;
  rerender();
  state.email = "b@example.test";
  rerender();
  await waitFor(() =>
    expect(result.current.accountIdOverride).toBe("account-b"),
  );
});
