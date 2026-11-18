import { readUIMessageStream, type UIMessage, type UIMessageChunk } from "ai";

/** Split only at explicit message starts; retain at most one boundary chunk.
 * SDK 7.0.69 neither resets seeded parts on start nor cancels upstream when its
 * output is cancelled, so both responsibilities belong to this coordinator.
 */
export async function* readResumedMessages({
  stream,
  getSeed,
  generateId,
  controller,
  onChunk,
}: {
  stream: ReadableStream<UIMessageChunk>;
  getSeed: () => UIMessage | undefined;
  generateId: () => string;
  controller: AbortController;
  onChunk: (chunk: UIMessageChunk) => void;
}): AsyncGenerator<UIMessage> {
  const reader = stream.getReader();
  let boundary: UIMessageChunk | undefined;
  let ended = false;
  let firstSegment = true;
  const cancel = () => {
    void reader.cancel(controller.signal.reason).catch(() => {});
  };
  controller.signal.addEventListener("abort", cancel, { once: true });
  try {
    while (!ended && !controller.signal.aborted) {
      const first = boundary
        ? { done: false as const, value: boundary }
        : await reader.read();
      boundary = undefined;
      if (first.done || controller.signal.aborted) break;
      const seed =
        firstSegment && first.value.type !== "start" ? getSeed() : undefined;
      firstSegment = false;
      let pending: UIMessageChunk | undefined = first.value;
      let started = false;
      const segment = new ReadableStream<UIMessageChunk>({
        async pull(output) {
          if (controller.signal.aborted) {
            output.close();
            return;
          }
          const next = pending
            ? { done: false as const, value: pending }
            : await reader.read();
          pending = undefined;
          if (next.done || controller.signal.aborted) {
            ended = true;
            output.close();
            return;
          }
          if (started && next.value.type === "start") {
            boundary = next.value;
            output.close();
            return;
          }
          started = true;
          onChunk(next.value);
          output.enqueue(next.value);
        },
      });
      for await (const message of readUIMessageStream({
        message: seed
          ? structuredClone(seed)
          : {
              id:
                first.value.type === "start" && first.value.messageId
                  ? first.value.messageId
                  : generateId(),
              role: "assistant",
              parts: [],
            },
        stream: segment,
        terminateOnError: true,
        onError: (error) => controller.abort(error),
      })) {
        if (controller.signal.aborted) break;
        yield message;
      }
    }
  } finally {
    controller.signal.removeEventListener("abort", cancel);
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
