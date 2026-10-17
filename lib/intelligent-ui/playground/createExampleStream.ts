import type { SurfaceEvent } from "../schema";

/** A bounded fixture replay, not a model call or a business operation. */
export function createExampleStream(
  events: SurfaceEvent[],
  signal: AbortSignal,
  delayMs = 1600,
): ReadableStream<Uint8Array> {
  let index = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let resume: (() => void) | undefined;
  let stopped = false;
  let stoppedByConsumer = false;
  const encoder = new TextEncoder();
  const stop = () => {
    stopped = true;
    clearTimeout(timer);
    resume?.();
    signal.removeEventListener("abort", stop);
  };
  return new ReadableStream({
    start() {
      signal.addEventListener("abort", stop, { once: true });
    },
    async pull(controller) {
      if (index > 0 && !signal.aborted && !stopped) {
        await new Promise<void>((resolve) => {
          resume = resolve;
          timer = setTimeout(resolve, delayMs);
        });
        resume = undefined;
      }
      if (signal.aborted || stopped || index >= events.length) {
        stop();
        // cancel() has already closed the controller when the consumer stopped.
        if (!stoppedByConsumer) controller.close();
        return;
      }
      controller.enqueue(
        encoder.encode(`${JSON.stringify(events[index++])}\n`),
      );
      if (index === events.length) {
        stop();
        controller.close();
      }
    },
    cancel() {
      stoppedByConsumer = true;
      stop();
    },
  });
}
