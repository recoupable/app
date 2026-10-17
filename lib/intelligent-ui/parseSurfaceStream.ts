import { surfaceEventSchema, type SurfaceEvent } from "./schema";
import { SURFACE_STREAM_LIMITS } from "./streamLimits";

/** Decode bounded NDJSON without assuming network chunks align with UTF-8 or lines. */
export async function* parseSurfaceStream(
  stream: ReadableStream<Uint8Array>,
  options: { signal?: AbortSignal } = {},
): AsyncGenerator<SurfaceEvent> {
  const { signal } = options;
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let line = "";
  let lineBytes = 0;
  let totalBytes = 0;
  let eventCount = 0;
  let finished = false;
  const onAbort = () => {
    void reader.cancel(signal?.reason).catch(() => undefined);
  };
  signal?.addEventListener("abort", onAbort, { once: true });
  try {
    while (true) {
      if (signal?.aborted)
        throw new DOMException("Surface stream aborted", "AbortError");
      const { done, value } = await reader.read();
      if (signal?.aborted)
        throw new DOMException("Surface stream aborted", "AbortError");
      if (done) {
        finished = true;
        line += decoder.decode();
        if (line.trim()) {
          if (++eventCount > SURFACE_STREAM_LIMITS.events)
            throw new Error("Surface event limit exceeded");
          yield surfaceEventSchema.parse(JSON.parse(line));
        }
        return;
      }
      totalBytes += value.byteLength;
      if (totalBytes > SURFACE_STREAM_LIMITS.totalBytes)
        throw new Error("Surface stream byte limit exceeded");
      let start = 0;
      for (let index = 0; index <= value.length; index++) {
        const newline = index < value.length && value[index] === 10;
        if (!newline && index !== value.length) continue;
        const segment = value.subarray(start, index);
        lineBytes += segment.byteLength;
        if (lineBytes > SURFACE_STREAM_LIMITS.lineBytes)
          throw new Error("Surface line byte limit exceeded");
        line += decoder.decode(segment, { stream: true });
        if (newline) {
          line += decoder.decode();
          if (line.trim()) {
            if (++eventCount > SURFACE_STREAM_LIMITS.events)
              throw new Error("Surface event limit exceeded");
            yield surfaceEventSchema.parse(JSON.parse(line));
            if (signal?.aborted)
              throw new DOMException("Surface stream aborted", "AbortError");
          }
          line = "";
          lineBytes = 0;
        }
        start = index + 1;
      }
    }
  } finally {
    signal?.removeEventListener("abort", onAbort);
    if (!finished) await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
