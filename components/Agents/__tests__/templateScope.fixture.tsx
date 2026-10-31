import React from "react";
import { AgentTemplateProvider } from "@/providers/AgentTemplateProvider";
import { cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, vi } from "vitest";

const { state, token, fetchMock } = vi.hoisted(() => ({
  state: {
    selection: "roster-a",
    actor: "actor-a",
    account: "account-a",
    authenticated: true,
    origin: "https://api.example.test",
  },
  token: vi.fn(),
  fetchMock: vi.fn(),
}));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    user: { id: state.actor },
    authenticated: state.authenticated,
    getAccessToken: token,
  }),
}));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({
    userData: { id: "profile-row", account_id: state.account },
    email: "owner@example.test",
  }),
}));
vi.mock("@/providers/AccountOverrideProvider", () => ({
  useAccountOverride: () => ({
    accountIdOverride: state.selection,
    email: "selected@example.test",
  }),
}));
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => state.origin,
}));
export const template = (id = "template-a", isPrivate = true) => ({
  id,
  title: id,
  description: "A useful template",
  prompt: "A useful template prompt for testing",
  tags: ["Marketing", "Deep Research"],
  creator: { id: "account-a", name: "Creator", image: null, is_admin: false },
  is_private: isPrivate,
  is_favourite: false,
  shared_emails: [],
  created_at: null,
  updated_at: null,
  favorites_count: 0,
});
export const response = (id = "template-a") => ({
  ok: true,
  json: async () => ({
    status: "success",
    templates: [template(id), template("public", false)],
  }),
});
export const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};
export let client: QueryClient;
export const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={client}>
    <AgentTemplateProvider>{children}</AgentTemplateProvider>
  </QueryClientProvider>
);
beforeEach(() => {
  Object.assign(state, {
    selection: "roster-a",
    actor: "actor-a",
    account: "account-a",
    authenticated: true,
    origin: "https://api.example.test",
  });
  token.mockReset().mockResolvedValue("fresh-token");
  fetchMock.mockReset().mockResolvedValue(response());
  vi.stubGlobal("fetch", fetchMock);
  client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
});
afterEach(() => {
  cleanup();
  client.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

export { state, token, fetchMock };
