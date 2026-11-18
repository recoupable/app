import { expect, it } from "vitest";
import type { UIMessageChunk } from "ai";
import { decodeContinuationStart } from "../decodeContinuationStart";
import fixture from "../__fixtures__/continuation-v1/projection-step.json";
const marker = () => ({
  version: 1,
  mode: "continuation",
  base: structuredClone(fixture.seed),
});
const start = (value: unknown): UIMessageChunk => ({
  type: "start",
  messageId: "assistant",
  messageMetadata: { recoupStream: value, kept: 7 },
});
it("strips only control metadata and preserves canonical original/proof payloads", async () => {
  const value = { ...marker(), base: fixture.result.responseMessage };
  const result = await decodeContinuationStart(start(value));
  expect(result.base).toEqual(value.base);
  expect(result.base).not.toBe(value.base);
  expect(result.chunk).toEqual({
    type: "start",
    messageId: "assistant",
    messageMetadata: { kept: 7 },
  });
});
const invalidCases: ReadonlyArray<readonly [string, () => unknown]> = [
  ["version", () => ({ ...marker(), version: 2 })],
  ["mode", () => ({ ...marker(), mode: "append" })],
  ["identity", () => ({ ...marker(), base: { ...fixture.seed, id: "other" } })],
  ["role", () => ({ ...marker(), base: { ...fixture.seed, role: "user" } })],
  [
    "nested",
    () => ({
      ...marker(),
      base: {
        ...fixture.seed,
        metadata: { nested: { recoupStream: marker() } },
      },
    }),
  ],
  ["null", () => null],
  ["unknown field", () => ({ ...marker(), trusted: true })],
  ["missing base", () => ({ version: 1, mode: "continuation" })],
  [
    "raw custom",
    () => ({
      ...marker(),
      base: { ...fixture.seed, parts: [{ type: "custom", kind: "unsafe" }] },
    }),
  ],
  [
    "raw reasoning file",
    () => ({
      ...marker(),
      base: {
        ...fixture.seed,
        parts: [
          {
            type: "reasoning-file",
            mediaType: "image/png",
            url: "https://never.invalid",
          },
        ],
      },
    }),
  ],
  [
    "malformed part",
    () => ({
      ...marker(),
      base: { ...fixture.seed, parts: [{ type: "text", text: 3 }] },
    }),
  ],
  [
    "parts count",
    () => ({
      ...marker(),
      base: {
        ...fixture.seed,
        parts: Array.from({ length: 2049 }, () => ({ type: "step-start" })),
      },
    }),
  ],
  [
    "bytes",
    () => ({
      ...marker(),
      base: { ...fixture.seed, metadata: { text: "é".repeat(524288) } },
    }),
  ],
  [
    "depth",
    () => ({
      ...marker(),
      base: {
        ...fixture.seed,
        metadata: Array.from({ length: 34 }).reduce<unknown>(
          (v) => ({ v }),
          null,
        ),
      },
    }),
  ],
  [
    "values",
    () => ({
      ...marker(),
      base: { ...fixture.seed, metadata: Array(50001).fill(0) },
    }),
  ],
  [
    "nonfinite",
    () => ({ ...marker(), base: { ...fixture.seed, metadata: NaN } }),
  ],
  [
    "undefined",
    () => ({ ...marker(), base: { ...fixture.seed, metadata: undefined } }),
  ],
  [
    "exotic",
    () => ({ ...marker(), base: { ...fixture.seed, metadata: new Date() } }),
  ],
  [
    "cycle",
    () => {
      const value: any = marker();
      value.base.metadata = value;
      return value;
    },
  ],
];
it.each(invalidCases)("rejects %s", async (_name, make) => {
  await expect(decodeContinuationStart(start(make()))).rejects.toThrow(
    "Invalid stream continuation",
  );
});
it("does not interpret an unmarked start as continuation", async () => {
  const chunk = { type: "start" as const, messageId: "assistant" };
  expect(await decodeContinuationStart(chunk)).toEqual({ chunk });
});
it("rejects control metadata outside a start", async () => {
  await expect(
    decodeContinuationStart({
      type: "message-metadata",
      messageMetadata: { recoupStream: marker() },
    }),
  ).rejects.toThrow();
});
