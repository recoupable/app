import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { Chat } from "@ai-sdk/react";
import type { UIMessage, UIMessageChunk } from "ai";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createWorkflowChatTransport } from "@/lib/chat/createWorkflowChatTransport";
import { createSnapshotConsumer } from "../../chat/createSnapshotConsumer";
import { getAnswerText } from "../../presentation/getAnswerText";
import { surfaceSchema } from "../../schema";
import { hostScope } from "./chatSnapshotFixture";
import { apiWireFixture as wire, apiWireResponse } from "./apiWireFixture";

const baseUrl = "https://recoup.invalid";
const finalAnswerText = [
  "Synthetic supplied counts · revision 12.",
  "Alpha accounts for 75% of the plays in this selection.",
  "Supplied listening counts\nPlays · 2026-09-01 to 2026-09-30\nTwo synthetic tracks. Complete supplied selection.\nAlpha: 900 plays\nBeta: 300 plays\nTotal supplied: 1,200 plays.",
  "Écoute fixture · revision 12 · Offline fixture counts · 2026-10-01T00:00:00Z · current · https://evidence.invalid/synthetic-counts",
].join("\n\n");

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function fixture(messages: UIMessage[] = []) {
  const consumer = createSnapshotConsumer(() => hostScope);
  const scopeKey = consumer.syncScope().key!;
  const received: UIMessageChunk[] = [];
  const finished = vi.fn();
  const chat: Chat<UIMessage> = new Chat({
    id: hostScope.chatId,
    messages: consumer.hydrate(messages, scopeKey),
    onData: (part) => received.push(structuredClone(part)),
    onFinish: finished,
    transport: createWorkflowChatTransport({
      baseUrl,
      getIds: () => ({
        chatId: hostScope.chatId,
        sessionId: hostScope.sessionId,
      }),
      getAccessToken: async () => "synthetic-token",
      snapshotConsumer: consumer,
      getMessages: () => chat.messages,
    }),
  });
  return { chat, consumer, scopeKey, received, finished };
}

function assertFinal({
  chat,
  consumer,
  scopeKey,
  received,
  finished,
}: ReturnType<typeof fixture>) {
  expect(chat.error).toBeUndefined();
  expect(chat.status).toBe("ready");
  const assistants = chat.messages.filter(
    (message) => message.role === "assistant",
  );
  expect(assistants).toHaveLength(1);
  expect(assistants[0].id).toBe("assistant-1");
  const snapshots = assistants[0].parts.filter(
    (part) => part.type === "data-intelligent-ui-snapshot",
  );
  expect(snapshots).toHaveLength(1);
  expect(snapshots[0]).toEqual(wire.chunks[19]);
  const accepted = consumer.getSnapshot(
    "assistant-1",
    "synthetic-summary",
    scopeKey,
  )!;
  expect(accepted.revision).toBe(12);
  expect(accepted.answer?.revision).toBe(12);
  expect(accepted.components[0]).toMatchObject({
    type: "distribution",
    items: [
      { id: "alpha", label: "Alpha", value: 900 },
      { id: "beta", label: "Beta", value: 300 },
    ],
  });
  expect(getAnswerText(accepted)).toBe(finalAnswerText);
  const revisions = received.flatMap((part) =>
    part.type === "data-intelligent-ui-snapshot" && "data" in part
      ? [(part.data as { revision: number }).revision]
      : [],
  );
  expect(revisions).toEqual([2, 12]);
  expect(received[0]).toEqual({
    type: "data-unrelated",
    id: "synthetic-other",
    data: { keep: true },
  });
  expect(received).toHaveLength(3);
  expect(assistants[0].parts).toEqual([
    {
      type: "text",
      text: "Résumé 🎵 — inspect the supplied counts.",
      state: "done",
    },
    {
      type: "reasoning",
      text: "Synthetic reasoning, not a provider call.",
      state: "done",
    },
    {
      type: "file",
      mediaType: "image/png",
      url: "https://media.invalid/synthetic.png",
    },
    expect.objectContaining({
      type: "tool-synthetic",
      toolCallId: "synthetic-call",
      state: "output-available",
      input: { dryRun: true },
      output: { result: "inert fixture" },
    }),
    { type: "data-unrelated", id: "synthetic-other", data: { keep: true } },
    wire.chunks[19],
    { type: "text", text: "Only supplied observations.", state: "done" },
  ]);
  expect(finished).toHaveBeenCalledTimes(1);
  expect(finished.mock.calls[0][0]).toMatchObject({
    finishReason: "stop",
    isAbort: false,
    isError: false,
  });
}

function assertSendRequest(input: unknown, init: RequestInit | undefined) {
  expect(input).toBe(`${baseUrl}/api/chat?streamLifecycle=explicit-stop-v1`);
  expect(init?.method).toBe("POST");
  expect(init?.headers).toEqual({
    "Content-Type": "application/json",
    Authorization: "Bearer synthetic-token",
  });
  expect(JSON.parse(init!.body as string)).toMatchObject({
    chatId: "synthetic-chat",
    sessionId: "synthetic-session",
    recoupAccessToken: "synthetic-token",
  });
}

function assertReconnectRequest(
  input: unknown,
  init: RequestInit | undefined,
  cursor: number,
) {
  expect(input).toBe(
    `${baseUrl}/api/chat/synthetic-chat/stream?startIndex=${cursor}&streamLifecycle=explicit-stop-v1`,
  );
  expect(init?.method ?? "GET").toBe("GET");
  expect(init?.body).toBeUndefined();
  expect(init?.headers).toEqual({
    "Content-Type": "application/json",
    Authorization: "Bearer synthetic-token",
  });
}

it("pins the actual API serializer capture, input, headers and every SSE record offset", () => {
  const hash = (bytes: Uint8Array) =>
    createHash("sha256").update(bytes).digest("hex");
  expect(wire.manifest.serializer).toEqual({
    package: "ai",
    version: "6.0.190",
    export: "createUIMessageStreamResponse",
    packageJson: {
      path: "package.json",
      sha256:
        "24d5988d689a1becea98cc9f09ffb5356afdfae92c70aec880bd64ae94b8689c",
    },
    entry: {
      path: "dist/index.mjs",
      sha256:
        "95a79e9ceea0e012c13a925e650d1ec72e50e41ba642553e3f7a2a3bf0ad3f7d",
    },
  });
  expect(wire.manifest.consumerSource.declaredVersions).toEqual({
    ai: "6.0.241",
    "@ai-sdk/react": "3.0.243",
    "@workflow/ai": "4.2.0",
  });
  const require = createRequire(import.meta.url);
  for (const name of ["ai", "@ai-sdk/react", "@workflow/ai"] as const) {
    const packagePath =
      name === "@workflow/ai"
        ? path.resolve(path.dirname(require.resolve(name)), "../package.json")
        : require.resolve(`${name}/package.json`);
    const installed = JSON.parse(readFileSync(packagePath, "utf8"));
    expect(installed.version).toBe(
      wire.manifest.consumerSource.declaredVersions[name],
    );
  }
  expect(wire.manifest.producerSource).toEqual({
    repository: "recoupable/api",
    commit: "2dbf74288d9bc5a205632c1fc52fc4a18855c3ff",
    tree: "063a57232e58ce7ec5116b3568201246bd311151",
    declaredAiVersion: "6.0.190",
    execution: "Installed SDK serializer only; API application not executed.",
  });
  expect(wire.manifest.input.bytes).toBe(wire.inputBytes.length);
  expect(wire.manifest.input.sha256).toBe(hash(wire.inputBytes));
  expect(wire.manifest.stream.bytes).toBe(wire.streamBytes.length);
  expect(wire.manifest.stream.sha256).toBe(hash(wire.streamBytes));
  expect(hash(wire.streamBytes)).toBe(
    "18a13fdf53bbea9db1ed72ffc1de4dbdb24b428502d89be643940ef52d920ec4",
  );
  expect(wire.manifest.input.chunkCount).toBe(24);
  expect(wire.manifest.stream.recordCount).toBe(25);
  expect(wire.offsets).toHaveLength(26);
  const records = wire.offsets
    .slice(1)
    .map((end, index) =>
      wire.streamBytes.subarray(wire.offsets[index], end).toString("utf8"),
    );
  expect(records.at(-1)).toBe("data: [DONE]\n\n");
  expect(wire.offsets.at(-1)).toBe(wire.streamBytes.length);
  expect(
    records.slice(0, -1).map((record) => {
      expect(record.startsWith("data: ")).toBe(true);
      expect(record.endsWith("\n\n")).toBe(true);
      return JSON.parse(record.slice(6, -2));
    }),
  ).toEqual(wire.chunks);
  expect(wire.manifest.response).toEqual({
    status: 200,
    headers: {
      "cache-control": "no-cache",
      connection: "keep-alive",
      "content-type": "text/event-stream",
      "x-accel-buffering": "no",
      "x-vercel-ai-ui-message-stream": "v1",
      "x-workflow-run-id": "synthetic-api-wire-run",
    },
  });
  for (const index of [12, 13, 14, 15, 19]) {
    const part = wire.chunks[index];
    expect(part.type).toBe("data-intelligent-ui-snapshot");
    expect("data" in part && surfaceSchema.safeParse(part.data).success).toBe(
      true,
    );
  }
  for (const index of [16, 17, 18]) {
    const part = wire.chunks[index];
    expect("data" in part && surfaceSchema.safeParse(part.data).success).toBe(
      false,
    );
  }
});

// A cut means the first HTTP body ends after N complete captured SSE records.
// Records 0..23 are raw chunks; record24 is [DONE], which is not a cursor chunk.
it.each(wire.offsets.map((offset, cut) => ({ cut, offset })))(
  "decodes captured API bytes with an HTTP cut after $cut complete SSE records",
  async ({ cut, offset }) => {
    const fetch = vi.fn(async (input: unknown, init?: RequestInit) => {
      if (fetch.mock.calls.length === 1) {
        assertSendRequest(input, init);
        return apiWireResponse(wire.streamBytes.subarray(0, offset));
      }
      expect(fetch.mock.calls.length).toBe(2);
      assertReconnectRequest(input, init, cut);
      return apiWireResponse(wire.streamBytes.subarray(offset));
    });
    vi.stubGlobal("fetch", fetch);
    const state = fixture();
    await state.chat.sendMessage({ text: "Synthetic question" });
    assertFinal(state);
    // Once finish was received, EOF is complete even before terminal [DONE].
    expect(fetch).toHaveBeenCalledTimes(cut < 24 ? 2 : 1);
  },
);

it("decodes every captured byte separately, including multibyte Unicode", async () => {
  const fetch = vi.fn(async (input: unknown, init?: RequestInit) => {
    expect(fetch.mock.calls.length).toBe(1);
    assertSendRequest(input, init);
    return apiWireResponse(wire.streamBytes, true);
  });
  vi.stubGlobal("fetch", fetch);
  const state = fixture();
  await state.chat.sendMessage({ text: "Synthetic question" });
  assertFinal(state);
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("retains first accepted values through rejected records and resumes from their raw cursor", async () => {
  const state = fixture();
  const fetch = vi.fn(async (input: unknown, init?: RequestInit) => {
    if (fetch.mock.calls.length === 1) {
      assertSendRequest(input, init);
      return apiWireResponse(wire.streamBytes.subarray(0, wire.offsets[13]));
    }
    if (fetch.mock.calls.length === 2) {
      assertReconnectRequest(input, init, 13);
      return apiWireResponse(
        wire.streamBytes.subarray(wire.offsets[13], wire.offsets[19]),
      );
    }
    expect(fetch.mock.calls.length).toBe(3);
    assertReconnectRequest(input, init, 19);
    await vi.waitFor(() => {
      expect(
        state.consumer.getSnapshot(
          "assistant-1",
          "synthetic-summary",
          state.scopeKey,
        )?.revision,
      ).toBe(2);
    });
    expect(state.received).toEqual([wire.chunks[11], wire.chunks[12]]);
    expect(
      state.consumer.getSnapshot(
        "assistant-1",
        "synthetic-summary",
        state.scopeKey,
      )?.components[0],
    ).toMatchObject({
      items: [{ value: 600 }, { value: 400 }],
    });
    return apiWireResponse(wire.streamBytes.subarray(wire.offsets[19]));
  });
  vi.stubGlobal("fetch", fetch);
  await state.chat.sendMessage({ text: "Synthetic question" });
  assertFinal(state);
  expect(fetch).toHaveBeenCalledTimes(3);
});

it("hydrates trusted saved revision 2 before the captured start-bearing replay", async () => {
  const saved: UIMessage[] = JSON.parse(
    JSON.stringify([
      {
        id: "assistant-1",
        role: "assistant",
        parts: [wire.chunks[12]],
      },
    ]),
  );
  const state = fixture(saved);
  expect(state.chat.messages[0].parts[0]).not.toBe(saved[0].parts[0]);
  const fetch = vi.fn(async (input: unknown, init?: RequestInit) => {
    expect(fetch.mock.calls.length).toBe(1);
    assertReconnectRequest(input, init, 0);
    return apiWireResponse(wire.streamBytes);
  });
  vi.stubGlobal("fetch", fetch);
  await state.chat.resumeStream();
  expect(state.chat.error).toBeUndefined();
  expect(state.chat.status).toBe("ready");
  expect(state.chat.messages).toHaveLength(1);
  expect(state.chat.messages[0].id).toBe("assistant-1");
  expect(
    state.chat.messages[0].parts.filter(
      (part) => part.type === "data-intelligent-ui-snapshot",
    ),
  ).toEqual([wire.chunks[19]]);
  expect(state.received).toEqual([wire.chunks[11], wire.chunks[19]]);
  expect(
    getAnswerText(
      state.consumer.getSnapshot(
        "assistant-1",
        "synthetic-summary",
        state.scopeKey,
      )!,
    ),
  ).toBe(finalAnswerText);
  expect(state.finished).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledTimes(1);
});
