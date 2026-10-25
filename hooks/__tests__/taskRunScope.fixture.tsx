import React from "react";
import { cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, vi } from "vitest";

const context = vi.hoisted(() => ({
  actor: "actor-a" as string | null,
  authenticated: true,
  account: null as string | null,
  email: null as string | null,
  origin: "https://api.example.test",
}));
const token = vi.hoisted(() => vi.fn<() => Promise<string | null>>());
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    user: context.actor ? { id: context.actor } : null,
    authenticated: context.authenticated,
    getAccessToken: token,
  }),
}));
vi.mock("@/providers/AccountOverrideProvider", () => ({
  useAccountOverride: () => ({
    accountIdOverride: context.account,
    email: context.email,
  }),
}));
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => context.origin,
}));
export const fetchMock = vi.fn();
export let client: QueryClient;
export const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);
export function response(label = "current", status = "COMPLETED") {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      status: "completed",
      createdAt: label,
      runs: [
        {
          id: label,
          status,
          metadata: null,
          taskIdentifier: "scheduled-task",
          createdAt: label,
        },
      ],
    }),
  } as Response;
}
export function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
beforeEach(() => {
  Object.assign(context, {
    actor: "actor-a",
    authenticated: true,
    account: null,
    email: null,
    origin: "https://api.example.test",
  });
  token.mockReset().mockResolvedValue("token-a");
  fetchMock.mockReset().mockResolvedValue(response());
  vi.stubGlobal("fetch", fetchMock);
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });
});
afterEach(() => {
  cleanup();
  client.clear();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

export { context, token };
