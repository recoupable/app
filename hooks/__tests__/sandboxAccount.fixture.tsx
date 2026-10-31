// @vitest-environment jsdom
import React from "react";
import { cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, vi } from "vitest";

const context = vi.hoisted(() => ({
  actor: "actor-a" as string | null,
  authenticated: true,
  account: null as string | null,
  email: null as string | null,
  origin: "https://api-synthetic-recoup.vercel.app",
}));
const token = vi.hoisted(() => vi.fn(async () => "synthetic-token"));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    user: context.actor ? { id: context.actor } : null,
    authenticated: context.authenticated && Boolean(context.actor),
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
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));
export const fetchMock = vi.fn();
export let client: QueryClient;
export const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);
export function response(data: object) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ status: "success", ...data }),
  } as Response;
}
beforeEach(() => {
  context.actor = "actor-a";
  context.authenticated = true;
  context.account = null;
  context.email = null;
  context.origin = "https://api-synthetic-recoup.vercel.app";
  token.mockReset().mockResolvedValue("synthetic-token");
  fetchMock
    .mockReset()
    .mockRejectedValue(new Error("Unexpected network request"));
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("NEXT_PUBLIC_GUARDED_GIT_API_ORIGIN", context.origin);
  client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
});
afterEach(() => {
  cleanup();
  client.clear();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

export { context, token };
