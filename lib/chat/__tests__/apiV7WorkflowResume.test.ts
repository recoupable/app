import { Chat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { afterEach, expect, it, vi } from "vitest";
import artifact from "../__fixtures__/api-7.0.2/owner-producer-fixtures.json";
import { ResumableChat } from "../ResumableChat";
import { createWorkflowChatTransport } from "../createWorkflowChatTransport";
import { createChatRequestLifecycle } from "../createChatRequestLifecycle";
import { createSnapshotConsumer } from "@/lib/intelligent-ui/chat/createSnapshotConsumer";
import { hostScope } from "@/lib/intelligent-ui/transport/__tests__/chatSnapshotFixture";

type Fixture = (typeof artifact.fixtures)[number];
const successful = artifact.fixtures.filter(
  (fixture) => fixture.scenario !== "error",
);
const legacy = artifact.fixtures.find(
  (fixture) => fixture.scenario === "continued-legacy-usage",
)!;
const finishOnly = 'data: {"type":"finish"}\n\ndata: [DONE]\n\n';
const json = (value: unknown) => JSON.parse(JSON.stringify(value));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function response(sse: string, fixture: Fixture) {
  const bytes = new TextEncoder().encode(sse);
  let offset = 0;
  return new Response(
    new ReadableStream<Uint8Array>({
      pull(output) {
        if (offset === bytes.length) {
          output.close();
          return;
        }
        // Deliberately bisect SSE framing and JSON tokens, independent of events.
        const end = Math.min(bytes.length, offset + (offset % 7) + 1);
        output.enqueue(bytes.slice(offset, end));
        offset = end;
      },
    }),
    { status: fixture.status, headers: fixture.headers },
  );
}

function setup(
  fixture: Fixture,
  snapshot: boolean,
  direct = false,
  terminalOnly = false,
) {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
  const events = fixture.sse.match(/[\s\S]*?\n\n/g)!;
  expect(events.join("")).toBe(fixture.sse);
  const first = events.slice(0, 3).join("");
  const rest = events.slice(3).join("");
  const bodies = terminalOnly ? [finishOnly] : [first, rest, finishOnly];
  const expectedCursors = terminalOnly ? [0] : [0, 3, fixture.chunks.length];
  const cursors: number[] = [];
  const fetch = vi.fn(
    async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(String(input));
      const index = cursors.length;
      if (index >= bodies.length) throw new Error("Unexpected synthetic fetch");
      expect(url.origin).toBe("https://recoup.invalid");
      expect(url.pathname).toBe(`/api/chat/${hostScope.chatId}/stream`);
      expect(init?.method ?? "GET").toBe("GET");
      const cursor = Number(url.searchParams.get("startIndex"));
      cursors.push(cursor);
      expect(cursor).toBe(expectedCursors[index]);
      return response(bodies[index], fixture);
    },
  );
  vi.stubGlobal("fetch", fetch);
  const messages = structuredClone(fixture.originalMessages) as UIMessage[];
  if (messages.at(-1)?.role !== "assistant") {
    messages.push({
      id: fixture.serverResponseMessage.id,
      role: "assistant",
      parts: [],
    });
  }
  const initial = structuredClone(messages);
  const onError = vi.fn();
  const onFinish = vi.fn();
  const credits = vi.fn();
  const lifecycle = createChatRequestLifecycle();
  const consumer = snapshot
    ? createSnapshotConsumer(() => hostScope)
    : undefined;
  consumer?.syncScope();
  const chat: Chat<UIMessage> = new (direct ? Chat : ResumableChat)({
    id: hostScope.chatId,
    messages,
    onError,
    onFinish,
    transport: createWorkflowChatTransport({
      baseUrl: "https://recoup.invalid",
      getIds: () => ({
        chatId: hostScope.chatId,
        sessionId: hostScope.sessionId,
      }),
      getAccessToken: async () => "synthetic-token",
      snapshotConsumer: consumer,
      getMessages: () => chat.messages,
      requestLifecycle: lifecycle,
      captureStreamEnd: () => credits,
    }),
  });
  return {
    chat,
    initial,
    onError,
    onFinish,
    credits,
    lifecycle,
    fetch,
    cursors,
    expectedCursors,
  };
}

it("keeps the complete owner artifact byte-for-byte frozen", () => {
  const bytes = readFileSync(
    new URL(
      "../__fixtures__/api-7.0.2/owner-producer-fixtures.json",
      import.meta.url,
    ),
  );
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(
    "3e5d87123e1bfc9dad699bf5a8655acd1b7973f09dd46b0a166d012937a8d6ba",
  );
  expect(artifact.apiHead).toBe("fe8a8738b51de6ab6293cee793cc3accfa9134ec");
  expect(artifact.fixtures).toHaveLength(5);
});

for (const snapshot of [false, true]) {
  it.each(successful)(
    `resumes owner $scenario bytes through Workflow and coordinator (snapshot=${snapshot})`,
    async (fixture) => {
      const test = setup(fixture, snapshot);
      await test.chat.resumeStream();
      expect(test.onError).not.toHaveBeenCalled();
      expect(test.chat.status).toBe("ready");
      expect(json(test.chat.messages)).toEqual([
        ...test.initial.slice(0, -1),
        fixture.serverResponseMessage,
      ]);
      expect(test.chat.messages.at(-1)?.id).toBe(test.initial.at(-1)?.id);
      expect(test.cursors).toEqual(test.expectedCursors);
      expect(test.fetch).toHaveBeenCalledTimes(3);
      expect(test.onFinish).toHaveBeenCalledTimes(1);
      expect(test.onFinish.mock.calls[0][0]).toMatchObject({
        isAbort: false,
        isError: false,
        isDisconnect: false,
      });
      expect(test.credits).toHaveBeenCalledTimes(1);
      expect(test.lifecycle.hasDispatchedRequest()).toBe(false);
      if (fixture.scenario === "continued-legacy-usage") {
        expect(test.chat.messages.at(-1)?.parts[0]).toEqual(
          test.initial.at(-1)?.parts[0],
        );
        expect(test.chat.messages.at(-1)?.metadata).toMatchObject({
          totalMessageUsage: {
            totalTokens: 45,
            inputTokenDetails: { cacheReadTokens: 7 },
            outputTokenDetails: { reasoningTokens: 4 },
          },
          totalMessageCost: 0.003,
        });
      }
    },
  );

  it(`preserves direct SDK cold-resume identity failure as a negative control (snapshot=${snapshot})`, async () => {
    const test = setup(legacy, snapshot, true);
    await test.chat.resumeStream();
    expect(test.onError).not.toHaveBeenCalled();
    expect(test.chat.status).toBe("ready");
    expect(test.cursors).toEqual(test.expectedCursors);
    expect(
      json(
        test.chat.messages.find(
          (message) => message.id === "fixture-assistant",
        ),
      ),
    ).toEqual(test.initial.at(-1));
    expect(json(test.chat.messages)).not.toContainEqual(
      legacy.serverResponseMessage,
    );
    expect(test.chat.messages.at(-1)?.id).not.toBe("fixture-assistant");
  });

  it(`settles a finish-only no-start tail without changing saved history (snapshot=${snapshot})`, async () => {
    const test = setup(legacy, snapshot, false, true);
    await test.chat.resumeStream();
    expect(test.onError).not.toHaveBeenCalled();
    expect(test.chat.status).toBe("ready");
    expect(json(test.chat.messages)).toEqual(test.initial);
    expect(test.fetch).toHaveBeenCalledTimes(1);
    expect(test.credits).toHaveBeenCalledTimes(1);
    expect(test.lifecycle.hasDispatchedRequest()).toBe(false);
  });
}

it.each([false, true])(
  "surfaces exact owner error bytes and aborts its reader (snapshot=%s)",
  async (snapshot) => {
    const fixture = artifact.fixtures.find(
      (value) => value.scenario === "error",
    )!;
    const test = setup(fixture, snapshot);
    test.initial.at(-1)!.parts = [
      { type: "text", text: "Synthetic saved prefix" },
    ];
    test.chat.messages = structuredClone(test.initial);
    await test.chat.resumeStream();
    expect(test.chat.status).toBe("error");
    expect(test.onError).toHaveBeenCalledTimes(1);
    expect(test.onError.mock.calls[0][0].message).toBe(
      "synthetic provider failure",
    );
    expect(test.chat.messages.slice(0, -1)).toEqual(test.initial.slice(0, -1));
    expect(test.chat.messages.at(-1)?.id).toBe(test.initial.at(-1)?.id);
    expect(test.chat.messages).toEqual(test.initial);
    // The owner's permissive server reader continues to later metadata. The App
    // deliberately terminates at error, so that later accounting is not applied.
    expect(test.chat.messages.at(-1)?.metadata).toBeUndefined();
    expect(test.onFinish).not.toHaveBeenCalled();
    expect(test.fetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(test.lifecycle.hasDispatchedRequest()).toBe(false);
  },
);
