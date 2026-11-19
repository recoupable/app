import { Chat } from "@ai-sdk/react";
import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";
import { describe, expect, it, vi } from "vitest";
import { ResumableChat } from "../ResumableChat";

const saved = (): UIMessage => ({
  id: "saved",
  role: "assistant",
  metadata: { trusted: true },
  parts: [
    { type: "text", text: "Retained prose", state: "done" },
    {
      type: "dynamic-tool",
      toolCallId: "tool",
      toolName: "read",
      state: "output-available",
      input: { id: 1 },
      output: { total: 4 },
    },
    { type: "data-observation", id: "observed", data: { revision: 1 } },
  ],
});
function chunks(values: UIMessageChunk[]) {
  return new ReadableStream<UIMessageChunk>({
    start(c) {
      values.forEach((value) => c.enqueue(value));
      c.close();
    },
  });
}
function transport(
  stream: ReadableStream<UIMessageChunk>,
): ChatTransport<UIMessage> {
  return {
    sendMessages: async () => {
      throw Error("Unexpected send");
    },
    reconnectToStream: async () => stream,
  };
}
const text = (id: string, value: string): UIMessageChunk[] => [
  { type: "text-start", id },
  { type: "text-delta", id, delta: value },
  { type: "text-end", id },
];

describe("App cold-resume compatibility", () => {
  it("keeps the direct SDK negative control: no-start resume does not seed saved history", async () => {
    const chat = new Chat({
      messages: [saved()],
      transport: transport(
        chunks([
          { type: "data-observation", id: "observed", data: { revision: 2 } },
          { type: "finish" },
        ]),
      ),
    });
    await chat.resumeStream();
    expect(chat.messages).toHaveLength(2);
    expect(chat.messages[0]).toEqual(saved());
  });
  it("continues one saved assistant, retaining prose, metadata and tool outcomes", async () => {
    const onData = vi.fn();
    const chat = new ResumableChat({
      messages: [saved()],
      onData,
      transport: transport(
        chunks([
          { type: "data-observation", id: "observed", data: { revision: 2 } },
          ...text("continued", "New prose"),
          { type: "finish" },
        ]),
      ),
    });
    await chat.resumeStream();
    expect(chat.messages).toHaveLength(1);
    expect(chat.messages[0].id).toBe("saved");
    expect(chat.messages[0].metadata).toEqual(saved().metadata);
    expect(chat.messages[0].parts.slice(0, 2)).toEqual(
      saved().parts.slice(0, 2),
    );
    expect(chat.messages[0].parts[2]).toEqual({
      type: "data-observation",
      id: "observed",
      data: { revision: 2 },
    });
    expect(chat.messages[0].parts[3]).toMatchObject({
      type: "text",
      text: "New prose",
    });
    expect(onData).toHaveBeenCalledTimes(1);
  });
  it.each(["saved", "different"])(
    "starts a full replay for %s without inheriting saved parts",
    async (messageId) => {
      const chat = new ResumableChat({
        messages: [saved()],
        transport: transport(
          chunks([
            { type: "start", messageId },
            ...text("replayed", "Full replay"),
            { type: "finish" },
          ]),
        ),
      });
      await chat.resumeStream();
      expect(chat.messages).toHaveLength(messageId === "saved" ? 1 : 2);
      expect(chat.messages.at(-1)?.id).toBe(messageId);
      expect(chat.messages.at(-1)?.parts).toEqual([
        {
          type: "text",
          text: "Full replay",
          state: "done",
          providerMetadata: undefined,
        },
      ]);
      if (messageId !== "saved") expect(chat.messages[0]).toEqual(saved());
    },
  );
  it("isolates a late start after no-start continuation without mixing messages", async () => {
    const chat = new ResumableChat({
      messages: [saved()],
      transport: transport(
        chunks([
          ...text("continued", "Continuation"),
          { type: "start", messageId: "new" },
          ...text("new-text", "Fresh"),
          { type: "finish" },
        ]),
      ),
    });
    await chat.resumeStream();
    expect(chat.messages.map((message) => message.id)).toEqual([
      "saved",
      "new",
    ]);
    expect(chat.messages[0].parts.at(-1)).toMatchObject({
      text: "Continuation",
    });
    expect(chat.messages[1].parts).toHaveLength(1);
    expect(chat.messages[1].parts[0]).toMatchObject({ text: "Fresh" });
  });
  it("keeps empty and transient-only resumes from creating blank assistants", async () => {
    const onData = vi.fn();
    const chat = new ResumableChat({
      onData,
      transport: transport(
        chunks([
          { type: "data-progress", data: 1, transient: true },
          { type: "finish" },
        ]),
      ),
    });
    await chat.resumeStream();
    expect(chat.messages).toEqual([]);
    expect(onData).toHaveBeenCalledTimes(1);
    expect(chat.status).toBe("ready");
  });
  it("aborts upstream and cancels its reader on explicit Stop without an error callback", async () => {
    let requestSignal: AbortSignal | undefined;
    const cancel = vi.fn();
    const onError = vi.fn();
    const upstream = new ReadableStream<UIMessageChunk>({
      start(c) {
        c.enqueue({ type: "start", messageId: "run" });
      },
      cancel,
    });
    const chat = new ResumableChat({
      onError,
      transport: {
        ...transport(upstream),
        reconnectToStream: async (request) => {
          requestSignal = request.abortSignal;
          return upstream;
        },
      },
    });
    const pending = chat.resumeStream();
    await vi.waitFor(() => expect(chat.status).toBe("streaming"));
    await chat.stop();
    await pending;
    expect(requestSignal?.aborted).toBe(true);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    expect(chat.status).toBe("ready");
  });
  it("aborts on fatal parser error, reports it once and never consumes later data", async () => {
    let requestSignal: AbortSignal | undefined;
    const onError = vi.fn(),
      onData = vi.fn(),
      cancel = vi.fn();
    const upstream = new ReadableStream<UIMessageChunk>({
      start(c) {
        c.enqueue({ type: "error", errorText: "fatal" });
        c.enqueue({ type: "data-observation", data: "must not publish" });
      },
      cancel,
    });
    const chat = new ResumableChat({
      messages: [saved()],
      onError,
      onData,
      transport: {
        ...transport(upstream),
        reconnectToStream: async (request) => {
          requestSignal = request.abortSignal;
          return upstream;
        },
      },
    });
    await chat.resumeStream();
    expect(chat.status).toBe("error");
    expect(chat.error?.message).toBe("fatal");
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onData).not.toHaveBeenCalled();
    expect(requestSignal?.aborted).toBe(true);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(chat.messages).toEqual([saved()]);
  });
  it("rejects stale ownership before pending stream resolution can publish or finish", async () => {
    let current = true;
    let resolve!: (stream: ReadableStream<UIMessageChunk>) => void;
    let requestSignal: AbortSignal | undefined;
    const onFinish = vi.fn(),
      cancel = vi.fn();
    const chat = new ResumableChat({
      messages: [saved()],
      onFinish,
      captureResumeScope: () => () => current,
      transport: {
        ...transport(chunks([])),
        reconnectToStream: (request) => {
          requestSignal = request.abortSignal;
          return new Promise((r) => {
            resolve = r;
          });
        },
      },
    });
    const pending = chat.resumeStream();
    await vi.waitFor(() => expect(resolve).toBeTypeOf("function"));
    current = false;
    resolve(
      new ReadableStream({
        start(c) {
          c.enqueue({ type: "data-observation", data: "stale" });
        },
        cancel,
      }),
    );
    await pending;
    expect(chat.messages).toEqual([saved()]);
    expect(requestSignal?.aborted).toBe(true);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(onFinish).not.toHaveBeenCalled();
  });
});
