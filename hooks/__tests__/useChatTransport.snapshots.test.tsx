// @vitest-environment jsdom
import React from "react";
import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useChatTransport } from "../useChatTransport";
import {
  chatSnapshotPart,
  hostScope,
} from "@/lib/intelligent-ui/transport/__tests__/chatSnapshotFixture";

import { getSnapshotScopeKey } from "@/lib/intelligent-ui/chat/getSnapshotScopeKey";
import { workflowResponse } from "@/lib/intelligent-ui/transport/__tests__/workflowResponse";

const access = vi.hoisted(() => ({
  getAccessToken: vi.fn(async () => "synthetic-token"),
}));
vi.mock("@privy-io/react-auth", () => ({ usePrivy: () => access }));
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => "https://recoup.invalid",
}));

beforeEach(() => {
  access.getAccessToken.mockReset().mockResolvedValue("synthetic-token");
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it("keeps transport stable while a committed scope switch hides old UI during rendering and invalidates late callbacks", () => {
  const { result, rerender, unmount } = renderHook(
    ({ scope }) => {
      const value = useChatTransport({
        chatId: scope.chatId,
        sessionId: scope.sessionId,
        snapshotScope: scope,
      });
      return {
        ...value,
        renderedSnapshot: value.intelligentUI?.consumer.getSnapshot(
          "assistant-1",
          "synthetic-summary",
          value.intelligentUI.scopeKey,
        ),
      };
    },
    { initialProps: { scope: structuredClone(hostScope) } },
  );
  const initial = result.current;
  const binding = initial.intelligentUI!;
  const oldStream = binding.consumer.beginStream({ messageId: "assistant-1" });
  expect(oldStream(chatSnapshotPart(1))).toBeTruthy();
  rerender({ scope: structuredClone(hostScope) });
  expect(result.current.renderedSnapshot?.revision).toBe(1);
  rerender({ scope: { ...hostScope, accountId: "another-account" } });
  expect(result.current.renderedSnapshot).toBeUndefined();
  expect(result.current.transport).toBe(initial.transport);
  expect(result.current.intelligentUI!.scopeKey).not.toBe(binding.scopeKey);
  expect(oldStream(chatSnapshotPart(2))).toBeUndefined();
  binding.consumer.hydrate(
    [{ id: "assistant-1", role: "assistant", parts: [chatSnapshotPart(5)] }],
    binding.scopeKey,
  );
  const next = result.current.intelligentUI!;
  expect(
    next.consumer.getSnapshot(
      "assistant-1",
      "synthetic-summary",
      next.scopeKey,
    ),
  ).toBeUndefined();
  const nextStream = next.consumer.beginStream({ messageId: "assistant-1" });
  expect(nextStream(chatSnapshotPart(3))).toBeTruthy();
  unmount();
  expect(nextStream(chatSnapshotPart(4))).toBeUndefined();
});

it("supports StrictMode setup/cleanup without reviving disposed in-flight streams", () => {
  const { result, unmount } = renderHook(
    () =>
      useChatTransport({
        chatId: hostScope.chatId,
        sessionId: hostScope.sessionId,
        snapshotScope: hostScope,
      }),
    {
      wrapper: ({ children }) => (
        <React.StrictMode>{children}</React.StrictMode>
      ),
    },
  );
  const binding = result.current.intelligentUI!;
  const stream = binding.consumer.beginStream({ messageId: "assistant-1" });
  expect(stream(chatSnapshotPart(1))).toBeTruthy();
  expect(
    binding.consumer.getSnapshot(
      "assistant-1",
      "synthetic-summary",
      binding.scopeKey,
    )?.revision,
  ).toBe(1);
  unmount();
  expect(stream(chatSnapshotPart(2))).toBeUndefined();
});

it("does not expose a binding without an explicit complete host scope or when the gate is off", () => {
  const { result, rerender } = renderHook(
    ({ enabled, scope }) => {
      vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", String(enabled));
      return useChatTransport({
        chatId: hostScope.chatId,
        sessionId: hostScope.sessionId,
        snapshotScope: scope,
      });
    },
    {
      initialProps: {
        enabled: true,
        scope: undefined as typeof hostScope | undefined,
      },
    },
  );
  expect(result.current.intelligentUI).toBeUndefined();
  rerender({ enabled: true, scope: { ...hostScope, actorId: "" } });
  expect(result.current.intelligentUI).toBeUndefined();
  rerender({ enabled: false, scope: hostScope });
  expect(result.current.intelligentUI).toBeUndefined();
});

it("cancels a catalog POST before fetch when committed workspace changes while auth is pending", async () => {
  const workspace = "22222222-2222-4222-8222-222222222222";
  const catalog = "11111111-1111-4111-8111-111111111111";
  const scope = {
    ...hostScope,
    workspaceId: workspace,
    workspaceKind: "organization",
    subject: { kind: "catalog", id: catalog },
  };
  let resolveToken!: (token: string) => void;
  access.getAccessToken.mockImplementationOnce(
    () =>
      new Promise<string>((resolve) => {
        resolveToken = resolve;
      }),
  );
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const { result, rerender } = renderHook(
    ({ scope }) =>
      useChatTransport({
        chatId: scope.chatId,
        sessionId: scope.sessionId,
        snapshotScope: scope,
      }),
    { initialProps: { scope } },
  );
  const stream = await result.current.transport.sendMessages({
    chatId: scope.chatId,
    messages: [],
    trigger: "submit-message",
    abortSignal: undefined,
  });
  const read = stream
    .getReader()
    .read()
    .catch((error: unknown) => error);
  await vi.waitFor(() => expect(resolveToken).toBeDefined());
  rerender({
    scope: { ...scope, workspaceId: "22222222-2222-4222-8222-222222222223" },
  });
  resolveToken("synthetic-token");
  await expect(read).resolves.toMatchObject({ name: "AbortError" });
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(fetch).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});

it.each(["production", "disabled"])(
  "reserves intelligentUI on the %s transport path without changing ordinary request fields",
  async (mode) => {
    if (mode === "production") vi.stubEnv("NODE_ENV", "production");
    else vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "false");
    const fetch = vi.fn(async (url, init) => {
      if (
        url !==
          "https://recoup.invalid/api/chat?streamLifecycle=explicit-stop-v1" ||
        init.method !== "POST"
      )
        throw new Error(`Unexpected synthetic request: ${url}`);
      return workflowResponse([{ type: "finish" }]);
    });
    vi.stubGlobal("fetch", fetch);
    const { result } = renderHook(() =>
      useChatTransport({
        chatId: hostScope.chatId,
        sessionId: hostScope.sessionId,
        snapshotScope: hostScope,
      }),
    );
    const ordinary = {
      model: "auto",
      roomId: "synthetic-room",
      artistId: "synthetic-artist",
      organizationId: "synthetic-org",
      accountId: "synthetic-override",
    };
    const stream = await result.current.transport.sendMessages({
      chatId: hostScope.chatId,
      messages: [],
      trigger: "submit-message",
      abortSignal: undefined,
      body: {
        ...ordinary,
        intelligentUI: { forged: true },
        devCatalogSurface: { forged: true },
      },
    });
    const reader = stream.getReader();
    while (!(await reader.read()).done) {
      /* Drain the synthetic SDK stream. */
    }
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      ...ordinary,
      messages: [],
      sessionId: hostScope.sessionId,
      chatId: hostScope.chatId,
      recoupAccessToken: "synthetic-token",
    });
    expect(fetch.mock.calls[0][1].headers).toMatchObject({
      Authorization: "Bearer synthetic-token",
    });
  },
);

it("preserves legacy scope keys and explicitly namespaces equal workspace IDs", () => {
  const legacy = JSON.stringify([
    hostScope.actorId,
    hostScope.accountId,
    hostScope.workspaceId,
    hostScope.sessionId,
    hostScope.chatId,
    hostScope.subject.kind,
    hostScope.subject.id,
  ]);
  expect(getSnapshotScopeKey(hostScope)).toBe(legacy);
  const organization = getSnapshotScopeKey({
    ...hostScope,
    workspaceKind: "organization",
  });
  const account = getSnapshotScopeKey({
    ...hostScope,
    workspaceKind: "account",
  });
  expect(organization).not.toBe(legacy);
  expect(account).not.toBe(organization);
});
