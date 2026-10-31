import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { UIMessageChunk } from "ai";
import manifest from "../__fixtures__/api-6.0.190/manifest.json";

const root = new URL("../__fixtures__/api-6.0.190/", import.meta.url);
const read = (name: string) => readFileSync(fileURLToPath(new URL(name, root)));

export const apiWireFixture = {
  manifest,
  inputBytes: read("input.json"),
  streamBytes: read("stream.sse"),
  chunks: JSON.parse(read("input.json").toString("utf8"))
    .chunks as UIMessageChunk[],
  // Include the empty prefix and the terminal [DONE] record boundary.
  offsets: [0, ...manifest.stream.recordEndOffsets],
};

/** The response body is always captured API bytes, never App-encoded chunks. */
export function apiWireResponse(bytes: Uint8Array, oneByteAtATime = false) {
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        if (oneByteAtATime) {
          for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
        } else controller.enqueue(new Uint8Array(bytes));
        controller.close();
      },
    }),
    apiWireFixture.manifest.response,
  );
}
