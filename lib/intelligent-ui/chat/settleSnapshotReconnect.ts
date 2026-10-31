import type { UIMessageChunk } from "ai";

/**
 * Chat snapshots its last assistant after reconnectToStream resolves. Holding
 * one filtered chunk lets history loaded before the bytes arrive seed that SDK
 * state. History arriving after the bytes remains outside this ordering bound.
 */
export async function settleSnapshotReconnect(
  stream: ReadableStream<UIMessageChunk>,
  signal: AbortSignal,
): Promise<ReadableStream<UIMessageChunk> | null> {
  const reader = stream.getReader();
  let abortRead!: () => void;
  const aborted = new Promise<ReadableStreamReadResult<UIMessageChunk>>(
    (resolve) => {
      abortRead = () => {
        void reader.cancel(signal.reason).catch(() => undefined);
        resolve({ done: true, value: undefined });
      };
    },
  );
  if (signal.aborted) abortRead();
  else signal.addEventListener("abort", abortRead, { once: true });
  try {
    let first: ReadableStreamReadResult<UIMessageChunk> | undefined =
      await Promise.race([reader.read(), aborted]);
    if (signal.aborted) {
      reader.releaseLock();
      return null;
    }
    return new ReadableStream<UIMessageChunk>({
      async pull(controller) {
        try {
          const next = first ?? (await reader.read());
          first = undefined;
          if (next.done) {
            controller.close();
            reader.releaseLock();
          } else controller.enqueue(next.value);
        } catch (error) {
          reader.releaseLock();
          controller.error(error);
        }
      },
      cancel(reason) {
        return reader.cancel(reason).finally(() => reader.releaseLock());
      },
    });
  } catch (error) {
    reader.releaseLock();
    if (signal.aborted) return null;
    throw error;
  } finally {
    signal.removeEventListener("abort", abortRead);
  }
}
