import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";
import { afterEach, expect, it, vi } from "vitest";
import { ResumableChat } from "../ResumableChat";
import { createWorkflowChatTransport } from "../createWorkflowChatTransport";
import { createChatRequestLifecycle } from "../createChatRequestLifecycle";
import { createSnapshotConsumer } from "@/lib/intelligent-ui/chat/createSnapshotConsumer";
import { hostScope } from "@/lib/intelligent-ui/transport/__tests__/chatSnapshotFixture";

const history = (): UIMessage[] => [
  {
    id: "older-assistant",
    role: "assistant",
    parts: [{ type: "text", text: "Earlier answer" }],
  },
  { id: "user", role: "user", parts: [{ type: "text", text: "Question" }] },
  {
    id: "saved-assistant",
    role: "assistant",
    parts: [{ type: "text", text: "Saved answer" }],
  },
];
const chunks = (values: UIMessageChunk[]) =>
  new ReadableStream<UIMessageChunk>({
    start(output) {
      for (const value of values) output.enqueue(value);
      output.close();
    },
  });
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it.each([false, true])(
  "releases the same chat instance after scope disposal (streaming=%s)",
  async (streaming) => {
    let generation = 1;
    let output!: ReadableStreamDefaultController<UIMessageChunk>;
    const onFinish = vi.fn();
    const onError = vi.fn();
    const reconnectToStream = vi
      .fn<ChatTransport<UIMessage>["reconnectToStream"]>()
      .mockResolvedValueOnce(
        new ReadableStream({
          start(controller) {
            output = controller;
          },
        }),
      )
      .mockResolvedValueOnce(
        chunks([
          { type: "start", messageId: "next-scope" },
          { type: "text-start", id: "next-text" },
          { type: "text-delta", id: "next-text", delta: "New scope answer" },
          { type: "text-end", id: "next-text" },
          { type: "finish" },
        ]),
      );
    const chat = new ResumableChat({
      id: "unchanged-chat",
      messages: history(),
      onFinish,
      onError,
      captureResumeScope: () => {
        const captured = generation;
        return () => captured === generation;
      },
      transport: { reconnectToStream, sendMessages: vi.fn() },
    });
    const pending = chat.resumeStream();
    await vi.waitFor(() => expect(chat.status).toBe("submitted"));
    if (streaming) {
      output.enqueue({ type: "text-start", id: "old-text" });
      output.enqueue({
        type: "text-delta",
        id: "old-text",
        delta: "Old scope partial",
      });
      await vi.waitFor(() =>
        expect(chat.messages.at(-1)?.parts).toContainEqual(
          expect.objectContaining({ type: "text", text: "Old scope partial" }),
        ),
      );
    }
    generation++;
    // Models the lifecycle's scope-aborted HTTP reader without replacing Chat.
    output.error(new DOMException("Scope disposed", "AbortError"));
    await pending;
    expect(chat.status).toBe("ready");
    expect(chat.error).toBeUndefined();
    expect(onFinish).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    chat.messages = [];
    await chat.resumeStream();
    expect(reconnectToStream).toHaveBeenCalledTimes(2);
    expect(chat.status).toBe("ready");
    expect(chat.messages.at(-1)?.id).toBe("next-scope");
    expect(onFinish).toHaveBeenCalledTimes(1);
  },
);

it.each(["older-assistant", "user"])(
  "rejects an incoming start ID colliding with unrelated %s history",
  async (messageId) => {
    const original = history();
    const onError = vi.fn();
    const onFinish = vi.fn();
    const chat = new ResumableChat({
      id: "chat",
      messages: structuredClone(original),
      onError,
      onFinish,
      transport: {
        sendMessages: vi.fn(),
        reconnectToStream: vi.fn().mockResolvedValue(
          chunks([
            { type: "start", messageId },
            { type: "text-start", id: "replacement" },
            {
              type: "text-delta",
              id: "replacement",
              delta: "Must not replace history",
            },
            { type: "text-end", id: "replacement" },
            { type: "finish" },
          ]),
        ),
      },
    });
    await chat.resumeStream();
    expect(chat.messages).toEqual(original);
    expect(chat.status).toBe("error");
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onFinish).not.toHaveBeenCalled();
  },
);

it.each([false, true])(
  "settles real lazy Workflow GET 204 without an error or completion credit (snapshot=%s)",
  async (snapshot) => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetch);
    const onError = vi.fn();
    const onFinish = vi.fn();
    const creditRefresh = vi.fn();
    const lifecycle = createChatRequestLifecycle();
    const consumer = snapshot
      ? createSnapshotConsumer(() => hostScope)
      : undefined;
    consumer?.syncScope();
    const original = history();
    const chat: ResumableChat = new ResumableChat({
      id: hostScope.chatId,
      messages: structuredClone(original),
      onError,
      onFinish,
      transport: createWorkflowChatTransport({
        baseUrl: "https://recoup.invalid",
        getIds: () => ({
          chatId: hostScope.chatId,
          sessionId: hostScope.sessionId,
        }),
        getAccessToken: async () => "synthetic-token",
        snapshotConsumer: consumer,
        getMessages: () => chat.messages,
        requestLifecycle: lifecycle,
        captureStreamEnd: () => creditRefresh,
      }),
    });
    await chat.resumeStream();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(String(fetch.mock.calls[0][0])).toContain(
      `/api/chat/${hostScope.chatId}/stream`,
    );
    expect(fetch.mock.calls[0][1]?.method ?? "GET").toBe("GET");
    expect(chat.status).toBe("ready");
    expect(chat.error).toBeUndefined();
    expect(chat.messages).toEqual(original);
    expect(onError).not.toHaveBeenCalled();
    expect(onFinish).not.toHaveBeenCalled();
    expect(creditRefresh).not.toHaveBeenCalled();
    expect(lifecycle.hasDispatchedRequest()).toBe(false);
  },
);
