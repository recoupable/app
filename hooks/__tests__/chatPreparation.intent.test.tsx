// @vitest-environment jsdom
import React from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useDeleteTrailingMessages } from "../useDeleteTrailingMessages";
import { usePersistSelectedModel } from "../usePersistSelectedModel";

const access = vi.hoisted(() => ({
  getAccessToken: vi.fn(async (): Promise<string | null> => "synthetic-token"),
}));
vi.mock("@privy-io/react-auth", () => ({ usePrivy: () => access }));
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => "https://recoup.invalid",
}));
beforeEach(() => {
  access.getAccessToken.mockReset().mockResolvedValue("synthetic-token");
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function pending<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function wrapper() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false, gcTime: 0 } },
  });
  return function IntentProvider({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

it.each(["auth", "response"])(
  "does not publish a stale trailing-deletion callback across its %s wait",
  async (stage) => {
    let current = true;
    const token = pending<string>();
    const response = pending<Response>();
    if (stage === "auth")
      access.getAccessToken.mockReturnValueOnce(token.promise);
    const fetch = vi.fn(async (url, init) => {
      if (
        url !==
          "https://recoup.invalid/api/chats/synthetic-chat/messages/trailing?from_message_id=synthetic-user" ||
        init.method !== "DELETE"
      )
        throw new Error(`Unexpected synthetic request: ${url}`);
      return response.promise;
    });
    vi.stubGlobal("fetch", fetch);
    const onSuccess = vi.fn();
    const { result } = renderHook(
      () => useDeleteTrailingMessages({ onSuccess }),
      { wrapper: wrapper() },
    );
    let operation!: Promise<void>;
    await act(async () => {
      operation = result.current.deleteTrailingMessages({
        chatId: "synthetic-chat",
        fromMessageId: "synthetic-user",
        isCurrent: () => current,
      });
    });
    await waitFor(() =>
      expect(
        stage === "auth" ? access.getAccessToken : fetch,
      ).toHaveBeenCalledTimes(1),
    );
    current = false;
    await act(async () => {
      token.resolve("synthetic-token");
      response.resolve(new Response(null, { status: 200 }));
      await operation;
    });
    expect(fetch).toHaveBeenCalledTimes(stage === "auth" ? 0 : 1);
    expect(onSuccess).not.toHaveBeenCalled();
  },
);

it.each(["auth", "response"])(
  "does not send/cache stale selected-model persistence across its %s wait",
  async (stage) => {
    let current = true;
    const token = pending<string>();
    const response = pending<Response>();
    if (stage === "auth")
      access.getAccessToken.mockReturnValueOnce(token.promise);
    const fetch = vi.fn(async (url, init) => {
      if (
        url !==
          "https://recoup.invalid/api/sessions/synthetic-session/chats/synthetic-chat" ||
        init.method !== "PATCH"
      )
        throw new Error(`Unexpected synthetic request: ${url}`);
      return response.promise;
    });
    vi.stubGlobal("fetch", fetch);
    const { result } = renderHook(() =>
      usePersistSelectedModel({
        sessionId: "synthetic-session",
        chatId: "synthetic-chat",
        model: "auto",
        getAccessToken: access.getAccessToken,
      }),
    );
    const operation = result.current(() => current);
    await waitFor(() =>
      expect(
        stage === "auth" ? access.getAccessToken : fetch,
      ).toHaveBeenCalledTimes(1),
    );
    current = false;
    token.resolve("synthetic-token");
    response.resolve(Response.json({ status: "success" }));
    await operation;
    expect(fetch).toHaveBeenCalledTimes(stage === "auth" ? 0 : 1);
    current = true;
    fetch.mockImplementation(async () => Response.json({ status: "success" }));
    await result.current(() => current);
    expect(fetch).toHaveBeenCalledTimes(stage === "auth" ? 1 : 2);
    await result.current();
    expect(fetch).toHaveBeenCalledTimes(stage === "auth" ? 1 : 2);
  },
);

it("keeps an ordinary current deletion's existing success callback", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(null, { status: 200 })),
  );
  const onSuccess = vi.fn();
  const { result } = renderHook(
    () => useDeleteTrailingMessages({ onSuccess }),
    { wrapper: wrapper() },
  );
  await act(async () => {
    await result.current.deleteTrailingMessages({
      chatId: "synthetic-chat",
      fromMessageId: "synthetic-user",
    });
  });
  expect(onSuccess).toHaveBeenCalledOnce();
});
