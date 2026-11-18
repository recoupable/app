import { expect, it, vi } from "vitest";
import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";
import { ResumableChat } from "../ResumableChat";
const base: UIMessage = {
  id: "assistant",
  role: "assistant",
  parts: [{ type: "text", text: "base", state: "done" }],
};
const start: UIMessageChunk = {
  type: "start",
  messageId: base.id,
  messageMetadata: { recoupStream: { version: 1, mode: "continuation", base } },
};
const stream = (chunks: UIMessageChunk[]) =>
  new ReadableStream<UIMessageChunk>({
    start(c) {
      for (const chunk of chunks) c.enqueue(chunk);
      c.close();
    },
  });
const text = (id: string, value: string): UIMessageChunk[] => [
  { type: "text-start", id },
  { type: "text-delta", id, delta: value },
  { type: "text-end", id },
];
for (const method of ["send", "resume"] as const) {
  it(`${method} validates marker before callbacks/mutation and cancels upstream`, async () => {
    const onError = vi.fn(),
      onData = vi.fn(),
      onFinish = vi.fn(),
      cancel = vi.fn();
    const upstream = new ReadableStream<UIMessageChunk>({
      start(c) {
        c.enqueue({
          ...start,
          messageMetadata: { recoupStream: { version: 2 } },
        });
        c.enqueue({ type: "data-private", data: "not published" });
      },
      cancel,
    });
    const chat = new ResumableChat({
      messages: [base],
      onError,
      onData,
      onFinish,
      transport: {
        sendMessages: async () => upstream,
        reconnectToStream: async () => upstream,
      },
    });
    if (method === "send") await chat.sendMessage();
    else await chat.resumeStream();
    expect(chat.messages).toEqual([base]);
    expect(chat.status).toBe("error");
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onData).not.toHaveBeenCalled();
    expect(onFinish).not.toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledTimes(1);
  });
  it(`${method} rebuilds an ahead history even when continuation is start/finish only`, async () => {
    const onFinish = vi.fn();
    const chat = new ResumableChat({
      messages: [
        { ...base, parts: [...base.parts, { type: "text", text: "ahead" }] },
      ],
      onFinish,
      transport: {
        sendMessages: async () => stream([start, { type: "finish" }]),
        reconnectToStream: async () => stream([start, { type: "finish" }]),
      },
    });
    if (method === "send") await chat.sendMessage();
    else await chat.resumeStream();
    expect(chat.messages).toEqual([base]);
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish.mock.calls[0][0].message).toEqual(base);
  });
  it(`${method} refuses a base belonging to an unrelated earlier assistant`, async () => {
    const older = { ...base, id: "older" };
    const chat = new ResumableChat({
      messages: [older, base],
      transport: {
        sendMessages: async () =>
          stream([
            {
              ...start,
              messageId: "older",
              messageMetadata: {
                recoupStream: { version: 1, mode: "continuation", base: older },
              },
            },
          ]),
        reconnectToStream: async () =>
          stream([
            {
              ...start,
              messageId: "older",
              messageMetadata: {
                recoupStream: { version: 1, mode: "continuation", base: older },
              },
            },
          ]),
      },
    });
    if (method === "send") await chat.sendMessage();
    else await chat.resumeStream();
    expect(chat.status).toBe("error");
    expect(chat.messages).toEqual([older, base]);
  });
}
it("send editing and regeneration keep public request semantics", async () => {
  const sendMessages = vi.fn<ChatTransport<UIMessage>["sendMessages"]>(
    async () =>
      stream([
        { type: "start", messageId: "answer" },
        ...text("answer-text", "Answer"),
        { type: "finish" },
      ]),
  );
  const chat = new ResumableChat({
    generateId: () => "generated",
    messages: [
      { id: "user", role: "user", parts: [{ type: "text", text: "old" }] },
      base,
    ],
    transport: { sendMessages, reconnectToStream: vi.fn() },
  });
  await chat.sendMessage(
    { messageId: "user", text: "edited", metadata: { revision: 2 } },
    { body: { model: "synthetic" } },
  );
  expect(sendMessages.mock.calls[0][0]).toMatchObject({
    trigger: "submit-message",
    messageId: "user",
    body: { model: "synthetic" },
    messages: [
      {
        id: "user",
        role: "user",
        parts: [{ type: "text", text: "edited" }],
        metadata: { revision: 2 },
      },
    ],
  });
  await chat.regenerate({ messageId: "answer" });
  expect(sendMessages.mock.calls[1][0]).toMatchObject({
    trigger: "regenerate-message",
    messageId: "answer",
    messages: [{ id: "user" }],
  });
  expect(chat.messages.map((m) => m.id)).toEqual(["user", "answer"]);
});
it("ordinary send isolates unmarked full replay and late starts", async () => {
  const chat = new ResumableChat({
    messages: [base],
    transport: {
      reconnectToStream: vi.fn(),
      sendMessages: async () =>
        stream([
          { type: "start", messageId: "assistant" },
          ...text("one", "Replay"),
          { type: "start", messageId: "new" },
          ...text("two", "New"),
          { type: "finish" },
        ]),
    },
  });
  await chat.sendMessage();
  expect(chat.messages.map((m) => m.id)).toEqual(["assistant", "new"]);
  expect(chat.messages[0].parts).toHaveLength(1);
  expect(chat.messages[0].parts[0]).toMatchObject({ text: "Replay" });
  expect(chat.messages[1].parts[0]).toMatchObject({ text: "New" });
});
it("ordinary send Stop cancels its source and produces one aborted finish", async () => {
  let output!: ReadableStreamDefaultController<UIMessageChunk>;
  const cancel = vi.fn(),
    onFinish = vi.fn(),
    onError = vi.fn();
  const chat = new ResumableChat({
    messages: [base],
    onFinish,
    onError,
    transport: {
      reconnectToStream: vi.fn(),
      sendMessages: async () =>
        new ReadableStream({
          start(c) {
            output = c;
            c.enqueue(start);
          },
          cancel,
        }),
    },
  });
  const pending = chat.sendMessage();
  await vi.waitFor(() => expect(chat.status).toBe("streaming"));
  expect(output).toBeDefined();
  await chat.stop();
  await pending;
  expect(cancel).toHaveBeenCalledTimes(1);
  expect(chat.status).toBe("ready");
  expect(onError).not.toHaveBeenCalled();
  expect(onFinish).toHaveBeenCalledTimes(1);
  expect(onFinish.mock.calls[0][0].isAbort).toBe(true);
});

it.each(["send", "regenerate"] as const)(
  "does not rebind queued stale %s after waiting for cancellation",
  async (method) => {
    let generation = 1;
    let release!: () => void;
    let cancelling = false;
    const cancelled = new Promise<void>((resolve) => {
      release = resolve;
    });
    const sendMessages = vi.fn();
    const chat = new ResumableChat({
      messages: [base],
      captureResumeScope: () => {
        const captured = generation;
        return () => captured === generation;
      },
      transport: {
        sendMessages,
        reconnectToStream: async () =>
          new ReadableStream({
            start(c) {
              c.enqueue(start);
            },
            cancel() {
              cancelling = true;
              return cancelled;
            },
          }),
      },
    });
    const previous = chat.resumeStream();
    await vi.waitFor(() => expect(chat.status).toBe("streaming"));
    const queued =
      method === "send"
        ? chat.sendMessage({ text: "stale user" })
        : chat.regenerate();
    await vi.waitFor(() => expect(cancelling).toBe(true));
    generation++;
    release();
    await previous;
    await queued;
    expect(chat.messages).toEqual([base]);
    expect(sendMessages).not.toHaveBeenCalled();
    expect(chat.status).toBe("ready");
  },
);
