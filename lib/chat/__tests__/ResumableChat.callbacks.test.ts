import type { UIMessageChunk } from "ai";
import { expect, it, vi } from "vitest";
import { ResumableChat } from "../ResumableChat";

function fixture() {
  let upstream!: ReadableStreamDefaultController<UIMessageChunk>;
  let signal: AbortSignal | undefined;
  const onFinish = vi.fn();
  const onError = vi.fn();
  const stream = new ReadableStream<UIMessageChunk>({
    start(controller) {
      upstream = controller;
      controller.enqueue({ type: "start", messageId: "response" });
      controller.enqueue({ type: "text-start", id: "text" });
      controller.enqueue({
        type: "text-delta",
        id: "text",
        delta: "Published",
      });
    },
  });
  const chat = new ResumableChat({
    onFinish,
    onError,
    transport: {
      sendMessages: async () => {
        throw new Error("Unexpected send");
      },
      reconnectToStream: async (request) => {
        signal = request.abortSignal;
        return stream;
      },
    },
  });
  return { chat, upstream, onFinish, onError, getSignal: () => signal };
}

async function waitForPublished(chat: ResumableChat) {
  await vi.waitFor(() => {
    expect(chat.messages).toHaveLength(1);
    expect(chat.messages[0].parts).toContainEqual(
      expect.objectContaining({ type: "text", text: "Published" }),
    );
  });
}

it("reports a fatal parser error after publication without calling it a disconnect", async () => {
  const { chat, upstream, onFinish, onError, getSignal } = fixture();
  const pending = chat.resumeStream();
  await waitForPublished(chat);
  upstream.enqueue({
    type: "text-delta",
    id: "missing-start",
    delta: "Invalid",
  });
  await pending;
  expect(onFinish).toHaveBeenCalledTimes(1);
  expect(onFinish).toHaveBeenCalledWith(
    expect.objectContaining({
      isError: true,
      isDisconnect: false,
      isAbort: false,
    }),
  );
  expect(onError).toHaveBeenCalledTimes(1);
  expect(getSignal()?.aborted).toBe(true);
  expect(chat.status).toBe("error");
});

it("reports a network failure after publication as both error and disconnect", async () => {
  const { chat, upstream, onFinish, onError, getSignal } = fixture();
  const pending = chat.resumeStream();
  await waitForPublished(chat);
  const failure = new TypeError("Network connection lost");
  upstream.error(failure);
  await pending;
  expect(onFinish).toHaveBeenCalledTimes(1);
  expect(onFinish).toHaveBeenCalledWith(
    expect.objectContaining({
      isError: true,
      isDisconnect: true,
      isAbort: false,
    }),
  );
  expect(onError).toHaveBeenCalledExactlyOnceWith(failure);
  expect(getSignal()?.aborted).toBe(true);
  expect(chat.status).toBe("error");
});

it("reports explicit Stop after publication as abort without error or disconnect", async () => {
  const { chat, onFinish, onError, getSignal } = fixture();
  const pending = chat.resumeStream();
  await waitForPublished(chat);
  await chat.stop();
  await pending;
  expect(onFinish).toHaveBeenCalledTimes(1);
  expect(onFinish).toHaveBeenCalledWith(
    expect.objectContaining({
      isAbort: true,
      isError: false,
      isDisconnect: false,
    }),
  );
  expect(onError).not.toHaveBeenCalled();
  expect(getSignal()?.aborted).toBe(true);
  expect(chat.status).toBe("ready");
});
