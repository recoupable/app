import { Chat } from "@ai-sdk/react";
import type { UIMessage, UIMessageChunk } from "ai";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createWorkflowChatTransport } from "@/lib/chat/createWorkflowChatTransport";
import { createSnapshotConsumer } from "../../chat/createSnapshotConsumer";
import type { SnapshotHostScope } from "../../chat/getSnapshotScopeKey";
import { SURFACE_STREAM_LIMITS } from "../../streamLimits";
import { chatSnapshotPart, hostScope } from "./chatSnapshotFixture";
import { workflowResponse } from "./workflowResponse";

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function fixture(messages: UIMessage[] = []) {
  let currentScope: SnapshotHostScope | undefined = structuredClone(hostScope);
  const consumer = createSnapshotConsumer(() => currentScope);
  const scopeKey = consumer.syncScope().key!;
  const received: UIMessageChunk[] = [];
  const saved = consumer.hydrate(messages, scopeKey);
  const chat: Chat<UIMessage> = new Chat({
    id: hostScope.chatId,
    messages: saved,
    onData: (part) => {
      received.push(structuredClone(part));
    },
    transport: createWorkflowChatTransport({
      baseUrl: "https://recoup.invalid",
      getIds: () => ({
        chatId: currentScope?.chatId ?? hostScope.chatId,
        sessionId: currentScope?.sessionId,
      }),
      getAccessToken: async () => "synthetic-token",
      snapshotConsumer: consumer,
      getMessages: () => chat.messages,
    }),
  });
  return {
    chat,
    consumer,
    scopeKey,
    received,
    setScope: (scope: SnapshotHostScope | undefined) => {
      currentScope = scope;
      consumer.syncScope();
    },
  };
}

const latestPart = (chat: Chat<UIMessage>) =>
  chat.messages
    .at(-1)
    ?.parts.find((part) => part.type === "data-intelligent-ui-snapshot");

it("validates before SDK overwrite, accepting full revision gaps and retaining ordinary text/completion", async () => {
  const invalid = chatSnapshotPart(8);
  invalid.data.answer!.revision = 7;
  const wrongWorkspace = chatSnapshotPart(9);
  wrongWorkspace.data.context.workspaceId = "another-workspace";
  const wrongSubject = chatSnapshotPart(10);
  wrongSubject.data.context.subject.id = "another-artist";
  const wrongId = { ...chatSnapshotPart(11), id: "wrong-id" };
  const changedIdentity = chatSnapshotPart(12);
  changedIdentity.data.id = changedIdentity.id = "another-surface";
  const patch = {
    type: "data-intelligent-ui-snapshot",
    id: "synthetic-summary",
    data: { type: "surface.patch", revision: 20 },
  } as UIMessageChunk;
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(
        workflowResponse([
          { type: "start", messageId: "assistant-1" },
          { type: "text-start", id: "intro" },
          { type: "text-delta", id: "intro", delta: "Ordinary answer." },
          { type: "text-end", id: "intro" },
          chatSnapshotPart(2),
          chatSnapshotPart(1),
          chatSnapshotPart(2, "Conflicting equal version"),
          invalid,
          wrongWorkspace,
          wrongSubject,
          wrongId,
          changedIdentity,
          patch,
          chatSnapshotPart(15, "Complete newest answer"),
          { type: "finish" },
        ]),
      ),
  );
  const { chat, received, consumer, scopeKey } = fixture();
  await chat.sendMessage({ text: "Synthetic question" });
  expect(chat.error).toBeUndefined();
  expect(chat.status).toBe("ready");
  expect(received).toEqual([
    chatSnapshotPart(2),
    chatSnapshotPart(15, "Complete newest answer"),
  ]);
  expect(latestPart(chat)).toEqual(
    chatSnapshotPart(15, "Complete newest answer"),
  );
  expect(chat.messages.at(-1)?.parts[0]).toMatchObject({
    type: "text",
    text: "Ordinary answer.",
    state: "done",
  });
  expect(
    consumer.getSnapshot("assistant-1", "synthetic-summary", scopeKey)
      ?.revision,
  ).toBe(15);
});

it.each([1, 2, 3, 4])(
  "retains accepted state across cut %i and counts rejected raw chunks in the reconnect cursor",
  async (cut) => {
    const chunks: UIMessageChunk[] = [
      { type: "start", messageId: "assistant-1" },
      chatSnapshotPart(4),
      chatSnapshotPart(2),
      chatSnapshotPart(6),
      { type: "finish" },
    ];
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(workflowResponse(chunks.slice(0, cut)))
      .mockResolvedValueOnce(workflowResponse(chunks.slice(cut)));
    vi.stubGlobal("fetch", fetch);
    const { chat, received } = fixture();
    await chat.sendMessage({ text: "Synthetic question" });
    expect(chat.error).toBeUndefined();
    expect(latestPart(chat)).toEqual(chatSnapshotPart(6));
    expect(received).toEqual([chatSnapshotPart(4), chatSnapshotPart(6)]);
    expect(fetch.mock.calls[1][0]).toBe(
      `https://recoup.invalid/api/chat/synthetic-chat/stream?startIndex=${cut}&streamLifecycle=explicit-stop-v1`,
    );
    expect(fetch.mock.calls[1][1].headers.Authorization).toBe(
      "Bearer synthetic-token",
    );
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({
      chatId: hostScope.chatId,
      sessionId: hostScope.sessionId,
      recoupAccessToken: "synthetic-token",
    });
  },
);

it("seeds a deep-parsed persisted snapshot before a replay without start and rejects older/equal/malformed replacements", async () => {
  const part = chatSnapshotPart(5, "Saved answer");
  const saved: UIMessage = {
    id: "assistant-1",
    role: "assistant",
    parts: [part],
  };
  const malformed = chatSnapshotPart(12);
  malformed.data.answer!.revision = 11;
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(
      workflowResponse([
        chatSnapshotPart(2),
        chatSnapshotPart(5),
        malformed,
        chatSnapshotPart(9),
        { type: "finish" },
      ]),
    );
  vi.stubGlobal("fetch", fetch);
  const { chat, consumer, scopeKey, received } = fixture([saved]);
  part.data.answer!.parts[0] = {
    type: "markdown",
    id: "explanation",
    text: "Mutated source",
  };
  expect(
    consumer.getSnapshot("assistant-1", part.id, scopeKey)?.fallbackText,
  ).toBe("Saved answer");
  expect(chat.messages[0].parts[0]).not.toBe(part);
  await chat.resumeStream();
  expect(chat.error).toBeUndefined();
  expect(chat.messages).toHaveLength(1);
  expect(received).toEqual([chatSnapshotPart(9)]);
  expect(latestPart(chat)).toEqual(chatSnapshotPart(9));
});

it("passes reasoning, file, tool outcomes, unknown data and ordinary text through unchanged", async () => {
  const file = {
    type: "file" as const,
    mediaType: "image/png",
    url: "https://media.invalid/synthetic.png",
  };
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValueOnce(
      workflowResponse([
        { type: "start", messageId: "assistant-1" },
        { type: "reasoning-start", id: "reason" },
        { type: "reasoning-delta", id: "reason", delta: "Reasoning" },
        { type: "reasoning-end", id: "reason" },
        file,
        {
          type: "tool-input-available",
          toolCallId: "call",
          toolName: "synthetic",
          input: {},
        },
        {
          type: "tool-output-available",
          toolCallId: "call",
          output: { dryRun: true },
        },
        { type: "data-unrelated", data: { keep: true } },
        chatSnapshotPart(1),
        { type: "text-start", id: "ending" },
        { type: "text-delta", id: "ending", delta: "Answer continues" },
        { type: "text-end", id: "ending" },
        { type: "finish" },
      ]),
    ),
  );
  const { chat } = fixture();
  await chat.sendMessage({ text: "Synthetic question" });
  expect(chat.error).toBeUndefined();
  expect(chat.messages.at(-1)?.parts).toEqual([
    expect.objectContaining({
      type: "reasoning",
      text: "Reasoning",
      state: "done",
    }),
    file,
    expect.objectContaining({
      type: "tool-synthetic",
      state: "output-available",
      output: { dryRun: true },
    }),
    { type: "data-unrelated", data: { keep: true } },
    chatSnapshotPart(1),
    { type: "text", text: "Answer continues", state: "done" },
  ]);
});

it.each([
  "actorId",
  "accountId",
  "workspaceId",
  "sessionId",
  "chatId",
  "subject",
] as const)(
  "drops late UI data after %s changes, retaining ordinary stream semantics",
  async (field) => {
    let release!: () => void;
    const waiting = new Promise<void>((resolve) => {
      release = resolve;
    });
    const response = workflowResponse([
      { type: "start", messageId: "assistant-1" },
      chatSnapshotPart(1),
    ]);
    const initial = new Uint8Array(await response.arrayBuffer());
    const final = new Uint8Array(
      await workflowResponse([
        chatSnapshotPart(2),
        { type: "finish" },
      ]).arrayBuffer(),
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        new Response(
          new ReadableStream({
            async start(controller) {
              controller.enqueue(initial);
              await waiting;
              controller.enqueue(final);
              controller.close();
            },
          }),
          { headers: response.headers },
        ),
      ),
    );
    const { chat, consumer, scopeKey, setScope } = fixture();
    const send = chat.sendMessage({ text: "Synthetic question" });
    await vi.waitFor(() =>
      expect(latestPart(chat)).toEqual(chatSnapshotPart(1)),
    );
    const changed = structuredClone(hostScope);
    if (field === "subject") changed.subject.id = "different-artist";
    else changed[field] = `different-${field}`;
    setScope(changed);
    release();
    await send;
    expect(chat.error).toBeUndefined();
    expect(latestPart(chat)).toEqual(chatSnapshotPart(1));
    expect(
      consumer.getSnapshot("assistant-1", "synthetic-summary", scopeKey),
    ).toBeUndefined();
    setScope(hostScope);
    expect(consumer.syncScope().key).not.toBe(scopeKey);
    consumer.hydrate(chat.messages, scopeKey);
    expect(
      consumer.getSnapshot(
        "assistant-1",
        "synthetic-summary",
        consumer.syncScope().key!,
      ),
    ).toBeUndefined();
  },
);

it("cancels late UI acceptance, retains the accepted snapshot, and allows a new stream generation", async () => {
  const { consumer, scopeKey } = fixture();
  const filter = consumer.beginStream({ messageId: "assistant-1" });
  expect(filter(chatSnapshotPart(2))).toEqual(chatSnapshotPart(2));
  consumer.cancel();
  expect(filter(chatSnapshotPart(3))).toBeUndefined();
  expect(
    consumer.getSnapshot("assistant-1", "synthetic-summary", scopeKey)
      ?.revision,
  ).toBe(2);
  const restarted = consumer.beginStream({ messageId: "assistant-1" });
  expect(restarted(chatSnapshotPart(4))).toEqual(chatSnapshotPart(4));
  consumer.dispose();
  expect(restarted(chatSnapshotPart(5))).toBeUndefined();
  expect(
    consumer.getSnapshot("assistant-1", "synthetic-summary", scopeKey),
  ).toBeUndefined();
  consumer.activate();
  expect(consumer.syncScope().key).toBe(scopeKey);
  expect(restarted(chatSnapshotPart(6))).toBeUndefined();
  expect(
    consumer.beginStream({ messageId: "assistant-1" })(chatSnapshotPart(7)),
  ).toEqual(chatSnapshotPart(7));
});

it("projects scope keys and reads accepted content without committing a speculative scope", () => {
  let scope = structuredClone(hostScope);
  const consumer = createSnapshotConsumer(() => scope);
  const scopeKey = consumer.syncScope().key!;
  const saved = consumer.hydrate(
    [{ id: "assistant-1", role: "assistant", parts: [chatSnapshotPart(1)] }],
    scopeKey,
  );
  const pending = consumer.prepareStream({ messageId: "assistant-1" });
  pending.bind();
  expect(pending.filter(chatSnapshotPart(2))).toBeTruthy();
  scope = { ...hostScope, workspaceId: "prospective-workspace" };
  const prospectiveKey = consumer.getBindingKey(scope)!;
  expect(prospectiveKey).not.toBe(scopeKey);
  expect(
    consumer.getSnapshot("assistant-1", "synthetic-summary", prospectiveKey),
  ).toBeUndefined();
  expect(
    consumer.getSnapshot("assistant-1", "synthetic-summary", scopeKey),
  ).toBeUndefined();
  expect(
    consumer.getFallback("assistant-1", saved[0].parts[0], scopeKey),
  ).toBeUndefined();
  expect(pending.signal.aborted).toBe(false);
  scope = structuredClone(hostScope);
  expect(consumer.getBindingKey(scope)).toBe(scopeKey);
  expect(
    consumer.getSnapshot("assistant-1", "synthetic-summary", scopeKey)
      ?.revision,
  ).toBe(2);
  expect(consumer.getFallback("assistant-1", saved[0].parts[0], scopeKey)).toBe(
    "Version 1",
  );
  expect(pending.filter(chatSnapshotPart(3))).toBeTruthy();
  scope = { ...hostScope, workspaceId: "prospective-workspace" };
  expect(consumer.syncScope().key).toBe(prospectiveKey);
  expect(pending.signal.aborted).toBe(true);
  expect(
    consumer.getSnapshot("assistant-1", "synthetic-summary", prospectiveKey),
  ).toBeUndefined();
});

it("ignores already-aborted streams and unavailable host scopes", () => {
  const { consumer, setScope } = fixture();
  const abort = new AbortController();
  abort.abort();
  expect(
    consumer.beginStream({ signal: abort.signal, messageId: "assistant-1" })(
      chatSnapshotPart(1),
    ),
  ).toBeUndefined();
  setScope(undefined);
  expect(
    consumer.beginStream({ messageId: "assistant-1" })(chatSnapshotPart(1)),
  ).toBeUndefined();
});

it("bounds candidate events/bytes without breaking text or discarding the last valid answer", async () => {
  const oversized = chatSnapshotPart(100);
  oversized.data.fallbackText = "x".repeat(SURFACE_STREAM_LIMITS.lineBytes);
  const candidates = Array.from(
    { length: SURFACE_STREAM_LIMITS.events + 1 },
    () => chatSnapshotPart(1),
  );
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(
        workflowResponse([
          { type: "start", messageId: "assistant-1" },
          ...candidates,
          oversized,
          chatSnapshotPart(2),
          { type: "text-start", id: "tail" },
          { type: "text-delta", id: "tail", delta: "Still readable" },
          { type: "text-end", id: "tail" },
          { type: "finish" },
        ]),
      ),
  );
  const { chat, received } = fixture();
  await chat.sendMessage({ text: "Synthetic question" });
  expect(chat.error).toBeUndefined();
  expect(chat.status).toBe("ready");
  expect(received).toEqual([chatSnapshotPart(1)]);
  expect(chat.messages.at(-1)?.parts).toContainEqual({
    type: "text",
    text: "Still readable",
    state: "done",
  });
});

it("retains deterministic text for snapshot-only history beyond the bounded full-snapshot ledger", () => {
  const history: UIMessage[] = Array.from({ length: 20 }, (_, index) => ({
    id: `saved-${index}`,
    role: "assistant",
    parts: [chatSnapshotPart(index + 1)],
  }));
  const { chat, consumer, scopeKey, setScope } = fixture(history);
  expect(
    consumer.getSnapshot("saved-0", "synthetic-summary", scopeKey),
  ).toBeUndefined();
  expect(
    consumer.getFallback("saved-0", chat.messages[0].parts[0], scopeKey),
  ).toBe("Version 1");
  const oldMessage = consumer.beginStream({
    messageId: "saved-0",
    getMessages: () => chat.messages,
  });
  expect(
    oldMessage(chatSnapshotPart(1, "Conflicting replay after eviction")),
  ).toBeUndefined();
  expect(
    oldMessage(chatSnapshotPart(2, "Newer complete answer after eviction")),
  ).toEqual(chatSnapshotPart(2, "Newer complete answer after eviction"));
  expect(
    consumer.getSnapshot("saved-19", "synthetic-summary", scopeKey)?.revision,
  ).toBe(20);
  expect(
    consumer.getFallback("saved-0", history[0].parts[0], scopeKey),
  ).toBeUndefined();
  setScope({ ...hostScope, accountId: "another-account" });
  expect(
    consumer.getFallback("saved-0", chat.messages[0].parts[0], scopeKey),
  ).toBeUndefined();
});

it("rejects oversized and multibyte candidates and bounds repeated invalid bytes while keeping ordinary completion", async () => {
  const oversized = {
    ...chatSnapshotPart(99),
    extra: "x".repeat(SURFACE_STREAM_LIMITS.lineBytes),
  };
  const multibyte = { ...chatSnapshotPart(100), extra: "🎵".repeat(70000) };
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValueOnce(
      workflowResponse([
        { type: "start", messageId: "assistant-1" },
        chatSnapshotPart(1),
        ...Array.from({ length: 8 }, (_, index) =>
          index % 2 ? oversized : multibyte,
        ),
        chatSnapshotPart(2),
        { type: "text-start", id: "tail" },
        {
          type: "text-delta",
          id: "tail",
          delta: "Readable after byte limit",
        },
        { type: "text-end", id: "tail" },
        { type: "finish" },
      ]),
    ),
  );
  const { chat, received } = fixture();
  await chat.sendMessage({ text: "Synthetic question" });
  expect(chat.status).toBe("ready");
  expect(chat.error).toBeUndefined();
  expect(received).toEqual([chatSnapshotPart(1)]);
  expect(chat.messages.at(-1)?.parts).toContainEqual({
    type: "text",
    text: "Readable after byte limit",
    state: "done",
  });
});

it("keeps the accepted answer after the actual Chat is stopped and ignores a delayed continuation", async () => {
  let release!: () => void;
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  const response = workflowResponse([
    { type: "start", messageId: "assistant-1" },
    chatSnapshotPart(1),
  ]);
  const initial = new Uint8Array(await response.arrayBuffer());
  const final = new Uint8Array(
    await workflowResponse([
      chatSnapshotPart(2),
      { type: "finish" },
    ]).arrayBuffer(),
  );
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValueOnce(
      new Response(
        new ReadableStream({
          async start(controller) {
            controller.enqueue(initial);
            await waiting;
            try {
              controller.enqueue(final);
              controller.close();
            } catch {
              /* A cancelled reader need not accept more bytes. */
            }
          },
        }),
        { headers: response.headers },
      ),
    ),
  );
  const { chat, consumer, scopeKey, received } = fixture();
  const send = chat.sendMessage({ text: "Synthetic question" });
  await vi.waitFor(() => expect(latestPart(chat)).toEqual(chatSnapshotPart(1)));
  consumer.cancel();
  await chat.stop();
  release();
  await send;
  expect(received).toEqual([chatSnapshotPart(1)]);
  expect(
    consumer.getSnapshot("assistant-1", "synthetic-summary", scopeKey)
      ?.revision,
  ).toBe(1);
  expect(chat.error).toBeUndefined();
  expect(chat.status).toBe("ready");
});

it.each([
  "actorId",
  "accountId",
  "workspaceId",
  "sessionId",
  "chatId",
  "queryKey",
  "subject",
] as const)(
  "expires captured preparation across committed %s changes even after returning",
  (field) => {
    const { consumer, setScope } = fixture();
    const isCurrent = consumer.captureSendIntent();
    const changed = structuredClone(hostScope);
    if (field === "subject")
      changed.subject = { kind: "catalog", id: "another-subject" };
    else changed[field] = "another-committed-value";
    setScope(changed);
    setScope(structuredClone(hostScope));
    expect(isCurrent()).toBe(false);
  },
);

it("keeps preparation current across own stream start and prospective-only reads, but never revives Stop/dispose", () => {
  const { consumer } = fixture();
  const isCurrent = consumer.captureSendIntent();
  consumer.getBindingKey({ ...hostScope, queryKey: "uncommitted-query" });
  expect(isCurrent()).toBe(true);
  consumer.beginStream();
  expect(isCurrent()).toBe(true);
  consumer.cancel();
  expect(isCurrent()).toBe(false);
  const next = consumer.captureSendIntent();
  consumer.dispose();
  consumer.activate();
  expect(next()).toBe(false);
});

it("allows stable-identity first-send provisioning to complete before dispatch", () => {
  let scope = { ...hostScope, sessionId: "", chatId: "client-placeholder" };
  const consumer = createSnapshotConsumer(() => scope);
  consumer.syncScope();
  const isCurrent = consumer.captureSendIntent();
  scope = { ...hostScope };
  consumer.syncScope();
  expect(isCurrent()).toBe(true);
});
