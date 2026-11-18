import { expect, it, vi } from "vitest";
import type { UIMessageChunk } from "ai";
import { ResumableChat } from "../ResumableChat";

it("coalesces within a scope but starts only the latest queued scope after stale cleanup", async () => {
  let scope = "old";
  let release!: (stream: ReadableStream<UIMessageChunk>) => void;
  const reconnect = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    )
    .mockImplementation(
      async () =>
        new ReadableStream<UIMessageChunk>({
          start(c) {
            c.enqueue({ type: "start", messageId: scope });
            c.enqueue({ type: "finish" });
            c.close();
          },
        }),
    );
  const chat = new ResumableChat({
    captureResumeScope: () => {
      const captured = scope;
      return () => captured === scope;
    },
    transport: {
      reconnectToStream: reconnect,
      sendMessages: async () => {
        throw Error("Unexpected send");
      },
    },
  });
  const old = chat.resumeStream();
  expect(chat.resumeStream()).toBe(old);
  await vi.waitFor(() => expect(reconnect).toHaveBeenCalledTimes(1));
  scope = "middle";
  const middle = chat.resumeStream();
  scope = "latest";
  const latest = chat.resumeStream();
  release(
    new ReadableStream({
      start(c) {
        c.close();
      },
    }),
  );
  await Promise.all([old, middle, latest]);
  expect(reconnect).toHaveBeenCalledTimes(2);
  expect(chat.messages.map((message) => message.id)).toEqual(["latest"]);
  expect(chat.status).toBe("ready");
});

it("explicit Stop invalidates a queued successor before stale reconnect resolves", async () => {
  let scope = "old";
  let release!: (stream: ReadableStream<UIMessageChunk>) => void;
  const reconnect = vi.fn(
    () =>
      new Promise<ReadableStream<UIMessageChunk>>((resolve) => {
        release = resolve;
      }),
  );
  const chat = new ResumableChat({
    captureResumeScope: () => {
      const captured = scope;
      return () => captured === scope;
    },
    transport: {
      reconnectToStream: reconnect,
      sendMessages: async () => {
        throw Error("Unexpected send");
      },
    },
  });
  const old = chat.resumeStream();
  await vi.waitFor(() => expect(reconnect).toHaveBeenCalledTimes(1));
  scope = "new";
  const queued = chat.resumeStream();
  const stopped = chat.stop();
  release(
    new ReadableStream({
      start(c) {
        c.close();
      },
    }),
  );
  await Promise.all([old, queued, stopped]);
  expect(reconnect).toHaveBeenCalledTimes(1);
  expect(chat.messages).toEqual([]);
  expect(chat.status).toBe("ready");
});
