import { afterEach, expect, it, vi } from "vitest";
import { surfaceSchema } from "../../schema";
import type { UIMessage } from "ai";
import { scope, snapshotPart } from "./snapshotPart";
import { workflowResponse } from "./workflowResponse";
import { syntheticChat } from "./syntheticChat";

afterEach(() => vi.unstubAllGlobals());

it("replaces a stable snapshot data part while retaining ordinary streamed text", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(
      workflowResponse([
        { type: "start", messageId: scope.messageId },
        { type: "text-start", id: "intro" },
        { type: "text-delta", id: "intro", delta: "A useful explanation." },
        { type: "text-end", id: "intro" },
        snapshotPart(1, "First version"),
        snapshotPart(2, "Second version"),
        { type: "finish" },
      ]),
    );
  vi.stubGlobal("fetch", fetch);
  const chat = syntheticChat();
  await chat.sendMessage({ text: "A synthetic question" });
  expect(chat.error).toBeUndefined();
  expect(chat.messages.at(-1)?.parts).toEqual([
    { type: "text", text: "A useful explanation.", state: "done" },
    snapshotPart(2, "Second version"),
  ]);
  expect(fetch).toHaveBeenCalledTimes(1);
});

it.each([1, 2, 3])(
  "resumes after fixture chunk %i and replaces one snapshot",
  async (cut) => {
    const chunks = [
      { type: "start" as const, messageId: scope.messageId },
      snapshotPart(1, "First version"),
      snapshotPart(2, "Resumed version"),
      { type: "finish" as const },
    ];
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(workflowResponse(chunks.slice(0, cut)))
      .mockResolvedValueOnce(workflowResponse(chunks.slice(cut)));
    vi.stubGlobal("fetch", fetch);
    const chat = syntheticChat();
    await chat.sendMessage({ text: "A synthetic question" });
    expect(chat.error).toBeUndefined();
    expect(chat.messages.at(-1)?.parts).toEqual([
      snapshotPart(2, "Resumed version"),
    ]);
    expect(fetch.mock.calls[1][0]).toBe(
      `https://recoup.invalid/api/chat/synthetic-chat/stream?startIndex=${cut}&streamLifecycle=explicit-stop-v1`,
    );
    expect(fetch.mock.calls[1][1].headers.Authorization).toBe(
      "Bearer synthetic-token",
    );
    expect(fetch).toHaveBeenCalledTimes(2);
  },
);

it("reloads a serialized SDK message and replaces its stable data ID after a replay", async () => {
  const saved: UIMessage = JSON.parse(
    JSON.stringify({
      id: scope.messageId,
      role: "assistant",
      parts: [snapshotPart(2, "Saved version")],
    }),
  );
  const received: unknown[] = [];
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(
      workflowResponse([
        { type: "start", messageId: scope.messageId },
        snapshotPart(1, "Old version"),
        snapshotPart(2, "Saved version"),
        snapshotPart(5, "Recovered version"),
        { type: "finish" },
      ]),
    );
  vi.stubGlobal("fetch", fetch);
  const chat = syntheticChat({
    messages: [saved],
    onData: (part) => {
      received.push(structuredClone(part));
    },
  });
  await chat.resumeStream();
  expect(chat.error).toBeUndefined();
  expect(chat.messages).toHaveLength(1);
  expect(received).toEqual([
    snapshotPart(1, "Old version"),
    snapshotPart(2, "Saved version"),
    snapshotPart(5, "Recovered version"),
  ]);
  expect(chat.messages[0].parts).toEqual([
    snapshotPart(5, "Recovered version"),
  ]);
  expect(fetch.mock.calls[0][0]).toBe(
    "https://recoup.invalid/api/chat/synthetic-chat/stream?startIndex=0&streamLifecycle=explicit-stop-v1",
  );
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("decodes snapshot and ordinary text through one-byte SSE chunks including split UTF-8", async () => {
  const response = workflowResponse([
    { type: "start", messageId: scope.messageId },
    { type: "text-start", id: "intro" },
    { type: "text-delta", id: "intro", delta: "Résumé 🎵" },
    { type: "text-end", id: "intro" },
    snapshotPart(1, "Écoute"),
    { type: "finish" },
  ]);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const fetch = vi.fn().mockResolvedValueOnce(
    new Response(
      new ReadableStream<Uint8Array>({
        start(controller) {
          for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
          controller.close();
        },
      }),
      { headers: response.headers },
    ),
  );
  vi.stubGlobal("fetch", fetch);
  const chat = syntheticChat();
  await chat.sendMessage({ text: "A synthetic question" });
  expect(chat.error).toBeUndefined();
  expect(chat.messages.at(-1)?.parts).toEqual([
    { type: "text", text: "Résumé 🎵", state: "done" },
    snapshotPart(1, "Écoute"),
  ]);
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("preserves reasoning, files and tool outcomes beside a snapshot on the existing stream", async () => {
  const file = {
    type: "file" as const,
    mediaType: "image/png",
    url: "https://media.invalid/synthetic.png",
  };
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValueOnce(
      workflowResponse([
        { type: "start", messageId: scope.messageId },
        { type: "reasoning-start", id: "reason" },
        {
          type: "reasoning-delta",
          id: "reason",
          delta: "Synthetic reasoning",
        },
        { type: "reasoning-end", id: "reason" },
        file,
        {
          type: "tool-input-available",
          toolCallId: "synthetic-call",
          toolName: "synthetic",
          input: { dryRun: true },
        },
        {
          type: "tool-output-available",
          toolCallId: "synthetic-call",
          output: { result: "synthetic" },
        },
        snapshotPart(1, "Accepted version"),
        { type: "finish" },
      ]),
    ),
  );
  const chat = syntheticChat();
  await chat.sendMessage({ text: "A synthetic question" });
  expect(chat.error).toBeUndefined();
  expect(chat.messages.at(-1)?.parts.map((part) => part.type)).toEqual([
    "reasoning",
    "file",
    "tool-synthetic",
    "data-intelligent-ui-snapshot",
  ]);
  expect(chat.messages.at(-1)?.parts).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        type: "reasoning",
        text: "Synthetic reasoning",
        state: "done",
      }),
      file,
      expect.objectContaining({
        type: "tool-synthetic",
        state: "output-available",
        output: { result: "synthetic" },
      }),
      snapshotPart(1, "Accepted version"),
    ]),
  );
});

it("treats snapshot data as opaque while preserving ordinary text and callback arrival order", async () => {
  const received: unknown[] = [];
  const invalid = snapshotPart(8, "Invalid answer");
  invalid.data.answer!.revision = 7;
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(
      workflowResponse([
        { type: "start", messageId: scope.messageId },
        { type: "text-start", id: "intro" },
        { type: "text-delta", id: "intro", delta: "A useful explanation." },
        { type: "text-end", id: "intro" },
        snapshotPart(2, "Accepted version"),
        snapshotPart(1, "Old version"),
        invalid,
        { type: "finish" },
      ]),
    );
  vi.stubGlobal("fetch", fetch);
  const chat = syntheticChat({
    // Later stable-ID replacements can mutate a part already held by SDK state.
    onData: (part) => {
      received.push(structuredClone(part));
    },
  });
  await chat.sendMessage({ text: "A synthetic question" });
  expect(chat.status).toBe("ready");
  expect(chat.error).toBeUndefined();
  expect(surfaceSchema.safeParse(invalid.data).success).toBe(false);
  expect(received).toEqual([
    snapshotPart(2, "Accepted version"),
    snapshotPart(1, "Old version"),
    invalid,
  ]);
  expect(chat.messages.at(-1)?.parts).toEqual([
    { type: "text", text: "A useful explanation.", state: "done" },
    invalid,
  ]);
});
