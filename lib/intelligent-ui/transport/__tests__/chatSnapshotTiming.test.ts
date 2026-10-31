import { Chat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createWorkflowChatTransport } from "@/lib/chat/createWorkflowChatTransport";
import { createSnapshotConsumer } from "../../chat/createSnapshotConsumer";
import type { SnapshotHostScope } from "../../chat/getSnapshotScopeKey";
import { chatSnapshotPart, hostScope } from "./chatSnapshotFixture";
import { workflowResponse } from "./workflowResponse";

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it.each(["unavailable", "pending-session"])(
  "accepts the first new-chat snapshot when %s scope becomes ready before POST",
  async (initial) => {
    let scope: SnapshotHostScope | undefined =
      initial === "unavailable"
        ? undefined
        : { ...hostScope, chatId: "placeholder", sessionId: "" };
    const consumer = createSnapshotConsumer(() => scope);
    const received: unknown[] = [];
    const fetch = vi
      .fn()
      .mockResolvedValue(
        workflowResponse([
          { type: "start", messageId: "assistant-1" },
          chatSnapshotPart(1),
          { type: "finish" },
        ]),
      );
    vi.stubGlobal("fetch", fetch);
    const chat: Chat<UIMessage> = new Chat({
      id: "placeholder",
      onData: (part) => {
        received.push(part);
      },
      transport: createWorkflowChatTransport({
        baseUrl: "https://recoup.invalid",
        getIds: () => ({
          chatId: scope?.chatId ?? "placeholder",
          sessionId: scope?.sessionId,
        }),
        getAccessToken: async () => "synthetic-token",
        snapshotConsumer: consumer,
        getMessages: () => chat.messages,
        waitForWorkspace: async () => {
          scope = structuredClone(hostScope);
          consumer.syncScope();
        },
      }),
    });
    await chat.sendMessage({ text: "First question while provisioning" });
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({
      chatId: hostScope.chatId,
      sessionId: hostScope.sessionId,
      recoupAccessToken: "synthetic-token",
    });
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe(
      "Bearer synthetic-token",
    );
    expect(chat.error).toBeUndefined();
    expect(chat.status).toBe("ready");
    expect(received).toEqual([chatSnapshotPart(1)]);
  },
);

it.each(["actorId", "accountId", "workspaceId", "subject"] as const)(
  "does not adopt a different %s while the workspace is pending",
  async (field) => {
    let scope: SnapshotHostScope = {
      ...hostScope,
      sessionId: "",
      chatId: "placeholder",
    };
    const consumer = createSnapshotConsumer(() => scope);
    const received: unknown[] = [];
    const candidate = chatSnapshotPart(1);
    const fetch = vi
      .fn()
      .mockImplementation(async () =>
        workflowResponse([
          { type: "start", messageId: "assistant-1" },
          candidate,
          { type: "finish" },
        ]),
      );
    vi.stubGlobal("fetch", fetch);
    const chat: Chat<UIMessage> = new Chat({
      id: "placeholder",
      onData: (part) => {
        received.push(part);
      },
      transport: createWorkflowChatTransport({
        baseUrl: "https://recoup.invalid",
        getIds: () => ({ chatId: scope.chatId, sessionId: scope.sessionId }),
        getAccessToken: async () => "synthetic-token",
        snapshotConsumer: consumer,
        getMessages: () => chat.messages,
        waitForWorkspace: async () => {
          scope = structuredClone(hostScope);
          if (field === "subject") scope.subject.id = "another-artist";
          else scope[field] = `another-${field}`;
          candidate.data.context = {
            workspaceId: scope.workspaceId,
            subject: { ...scope.subject, label: "Matching later scope" },
          };
          consumer.syncScope();
        },
      }),
    });
    await chat.sendMessage({ text: "Question before selection changed" });
    expect(fetch.mock.calls.length).toBeLessThanOrEqual(1);
    expect(chat.error).toBeUndefined();
    expect(received).toEqual([]);
  },
);

it("cannot revive a stopped send when provisioning subsequently completes", async () => {
  let scope: SnapshotHostScope = {
    ...hostScope,
    sessionId: "",
    chatId: "placeholder",
  };
  const consumer = createSnapshotConsumer(() => scope);
  const received: unknown[] = [];
  let release!: () => void;
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  const entered = vi.fn();
  const fetch = vi.fn().mockImplementation(async (_url, init) => {
    if (init.signal.aborted) throw new DOMException("Aborted", "AbortError");
    return workflowResponse([
      { type: "start", messageId: "assistant-1" },
      chatSnapshotPart(1),
      { type: "finish" },
    ]);
  });
  vi.stubGlobal("fetch", fetch);
  const chat: Chat<UIMessage> = new Chat({
    id: "placeholder",
    onData: (part) => {
      received.push(part);
    },
    transport: createWorkflowChatTransport({
      baseUrl: "https://recoup.invalid",
      getIds: () => ({ chatId: scope.chatId, sessionId: scope.sessionId }),
      getAccessToken: async () => "synthetic-token",
      snapshotConsumer: consumer,
      getMessages: () => chat.messages,
      waitForWorkspace: async () => {
        entered();
        await waiting;
        scope = structuredClone(hostScope);
        consumer.syncScope();
      },
    }),
  });
  const send = chat.sendMessage({ text: "Question while provisioning" });
  await vi.waitFor(() => expect(entered).toHaveBeenCalledOnce());
  consumer.cancel();
  await chat.stop();
  release();
  await send;
  expect(received).toEqual([]);
  expect(chat.error).toBeUndefined();
  expect(chat.status).toBe("ready");
  for (const call of fetch.mock.calls)
    expect(call[1].signal.aborted).toBe(true);
});

it("freezes an already-selected request scope before async authentication/response work", async () => {
  let scope = structuredClone(hostScope);
  const consumer = createSnapshotConsumer(() => scope);
  const received: unknown[] = [];
  const later = chatSnapshotPart(1);
  const fetch = vi.fn().mockImplementation(async () => {
    scope = { ...hostScope, accountId: "another-account" };
    consumer.syncScope();
    return workflowResponse([
      { type: "start", messageId: "assistant-1" },
      later,
      { type: "finish" },
    ]);
  });
  vi.stubGlobal("fetch", fetch);
  const chat: Chat<UIMessage> = new Chat({
    id: hostScope.chatId,
    onData: (part) => {
      received.push(part);
    },
    transport: createWorkflowChatTransport({
      baseUrl: "https://recoup.invalid",
      getIds: () => ({ chatId: scope.chatId, sessionId: scope.sessionId }),
      getAccessToken: async () => "synthetic-token",
      snapshotConsumer: consumer,
      getMessages: () => chat.messages,
    }),
  });
  await chat.sendMessage({ text: "A question under the original scope" });
  expect(received).toEqual([]);
  expect(chat.error).toBeUndefined();
});

it("does not revive a pending request after an actor changes away and back", async () => {
  let scope = { ...hostScope, sessionId: "", chatId: "placeholder" };
  const consumer = createSnapshotConsumer(() => scope);
  const received: unknown[] = [];
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        workflowResponse([
          { type: "start", messageId: "assistant-1" },
          chatSnapshotPart(1),
          { type: "finish" },
        ]),
      ),
  );
  const chat = new Chat({
    id: "placeholder",
    onData: (part) => {
      received.push(part);
    },
    transport: createWorkflowChatTransport({
      baseUrl: "https://recoup.invalid",
      getIds: () => ({ chatId: scope.chatId, sessionId: scope.sessionId }),
      getAccessToken: async () => "synthetic-token",
      snapshotConsumer: consumer,
      waitForWorkspace: async () => {
        scope = { ...scope, actorId: "another-actor" };
        consumer.syncScope();
        scope = structuredClone(hostScope);
        consumer.syncScope();
      },
    }),
  });
  await chat.sendMessage({ text: "Pending original question" });
  expect(received).toEqual([]);
  expect(chat.error).toBeUndefined();
});

it.each(["fresh-getter", "render-lagging-getter"])(
  "resolves no-start resume from correctly bound history loaded before bytes (%s)",
  async (getter) => {
    const consumer = createSnapshotConsumer(() => hostScope);
    const scopeKey = consumer.syncScope().key!;
    let loaded: UIMessage[] = [];
    let release!: () => void;
    const waiting = new Promise<void>((resolve) => {
      release = resolve;
    });
    const invalid = chatSnapshotPart(4);
    invalid.data.answer!.revision = 3;
    const response = workflowResponse([
      chatSnapshotPart(1),
      invalid,
      chatSnapshotPart(2),
      { type: "finish" },
    ]);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        new ReadableStream({
          async start(controller) {
            await waiting;
            controller.enqueue(bytes);
            controller.close();
          },
        }),
        { headers: response.headers },
      ),
    );
    vi.stubGlobal("fetch", fetch);
    const received: unknown[] = [];
    const chat: Chat<UIMessage> = new Chat({
      id: hostScope.chatId,
      onData: (part) => {
        received.push(part);
      },
      transport: createWorkflowChatTransport({
        baseUrl: "https://recoup.invalid",
        getIds: () => ({
          chatId: hostScope.chatId,
          sessionId: hostScope.sessionId,
        }),
        getAccessToken: async () => "synthetic-token",
        snapshotConsumer: consumer,
        getMessages: () => (getter === "fresh-getter" ? loaded : []),
      }),
    });
    const resume = chat.resumeStream();
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    loaded = consumer.hydrate(
      [
        {
          id: "assistant-1",
          role: "assistant",
          parts: [
            { type: "text", text: "Original saved explanation." },
            chatSnapshotPart(1),
          ],
        },
      ],
      scopeKey,
    );
    chat.messages = loaded;
    release();
    await resume;
    expect(chat.error).toBeUndefined();
    expect(chat.status).toBe("ready");
    expect(received).toEqual([chatSnapshotPart(2)]);
    expect(chat.messages).toHaveLength(1);
    expect(chat.messages[0].parts).toEqual([
      { type: "text", text: "Original saved explanation." },
      chatSnapshotPart(2),
    ]);
  },
);

it("does not derive a no-start target from unbound raw SDK history", async () => {
  const consumer = createSnapshotConsumer(() => hostScope);
  const raw: UIMessage[] = [
    { id: "assistant-1", role: "assistant", parts: [chatSnapshotPart(1)] },
  ];
  const received: unknown[] = [];
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        workflowResponse([chatSnapshotPart(2), { type: "finish" }]),
      ),
  );
  const chat = new Chat({
    id: hostScope.chatId,
    messages: raw,
    onData: (part) => {
      received.push(part);
    },
    transport: createWorkflowChatTransport({
      baseUrl: "https://recoup.invalid",
      getIds: () => ({
        chatId: hostScope.chatId,
        sessionId: hostScope.sessionId,
      }),
      getAccessToken: async () => "synthetic-token",
      snapshotConsumer: consumer,
      getMessages: () => raw,
    }),
  });
  await chat.resumeStream();
  expect(chat.error).toBeUndefined();
  expect(received).toEqual([]);
});

it("can resume a bound ordinary-text history answer before its first UI fragment", async () => {
  const consumer = createSnapshotConsumer(() => hostScope);
  const key = consumer.syncScope().key!;
  const loaded = consumer.hydrate(
    [
      {
        id: "assistant-1",
        role: "assistant",
        parts: [{ type: "text", text: "Ordinary existing prose." }],
      },
    ],
    key,
  );
  const received: unknown[] = [];
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        workflowResponse([chatSnapshotPart(1), { type: "finish" }]),
      ),
  );
  const chat = new Chat({
    id: hostScope.chatId,
    messages: loaded,
    onData: (part) => {
      received.push(part);
    },
    transport: createWorkflowChatTransport({
      baseUrl: "https://recoup.invalid",
      getIds: () => ({
        chatId: hostScope.chatId,
        sessionId: hostScope.sessionId,
      }),
      getAccessToken: async () => "synthetic-token",
      snapshotConsumer: consumer,
      getMessages: () => loaded,
    }),
  });
  await chat.resumeStream();
  expect(chat.error).toBeUndefined();
  expect(received).toEqual([chatSnapshotPart(1)]);
  expect(chat.messages[0].parts[0]).toMatchObject({
    type: "text",
    text: "Ordinary existing prose.",
  });
});

it.each(["stop", "unmount"])(
  "settles a reconnect cancelled by %s while its first chunk is pending and releases its reader",
  async (reason) => {
    const consumer = createSnapshotConsumer(() => hostScope);
    const received: unknown[] = [];
    let bodyController!: ReadableStreamDefaultController<Uint8Array>;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        bodyController = controller;
      },
    });
    const fetch = vi.fn().mockImplementation(async (_url, options) => {
      options.signal.addEventListener(
        "abort",
        () => bodyController.error(new DOMException("Aborted", "AbortError")),
        { once: true },
      );
      return new Response(body, {
        headers: { "x-workflow-run-id": "synthetic-run" },
      });
    });
    vi.stubGlobal("fetch", fetch);
    const chat = new Chat({
      id: hostScope.chatId,
      onData: (part) => {
        received.push(part);
      },
      transport: createWorkflowChatTransport({
        baseUrl: "https://recoup.invalid",
        getIds: () => ({
          chatId: hostScope.chatId,
          sessionId: hostScope.sessionId,
        }),
        getAccessToken: async () => "synthetic-token",
        snapshotConsumer: consumer,
        getMessages: () => [],
      }),
    });
    let settled = false;
    const resume = chat.resumeStream().then(() => {
      settled = true;
    });
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    if (reason === "stop") {
      consumer.cancel();
      await chat.stop();
    } else consumer.dispose();
    await vi.waitFor(() => expect(settled).toBe(true));
    await resume;
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
    await vi.waitFor(() => expect(body.locked).toBe(false));
    expect(received).toEqual([]);
    expect(chat.error).toBeUndefined();
    expect(chat.status).toBe("ready");
  },
);

it("propagates a reconnect failure before the first chunk without swallowing the ordinary chat error", async () => {
  const consumer = createSnapshotConsumer(() => hostScope);
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(new Response("Synthetic failure", { status: 500 })),
  );
  const chat = new Chat({
    id: hostScope.chatId,
    transport: createWorkflowChatTransport({
      baseUrl: "https://recoup.invalid",
      getIds: () => ({
        chatId: hostScope.chatId,
        sessionId: hostScope.sessionId,
      }),
      getAccessToken: async () => "synthetic-token",
      snapshotConsumer: consumer,
    }),
  });
  await chat.resumeStream();
  expect(chat.status).toBe("error");
  expect(chat.error?.message).toContain(
    "Failed to fetch chat: 500 Synthetic failure",
  );
});
