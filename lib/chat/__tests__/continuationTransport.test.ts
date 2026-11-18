import { afterEach, expect, it, vi } from "vitest";
import type { UIMessage } from "ai";
import fixture from "../__fixtures__/continuation-v1/projection-step.json";
import { ResumableChat } from "../ResumableChat";
import { createChatRequestLifecycle } from "../createChatRequestLifecycle";
import { createWorkflowChatTransport } from "../createWorkflowChatTransport";
import { createSnapshotConsumer } from "@/lib/intelligent-ui/chat/createSnapshotConsumer";
import { hostScope } from "@/lib/intelligent-ui/transport/__tests__/chatSnapshotFixture";
const json = (value: unknown) => JSON.parse(JSON.stringify(value));
const chunks = [
  {
    type: "start",
    messageId: "assistant",
    messageMetadata: {
      recoupStream: { version: 1, mode: "continuation", base: fixture.seed },
    },
  },
  ...fixture.chunks,
  { type: "finish" },
];
function response(values: unknown[]) {
  const bytes = new TextEncoder().encode(
    values.map((value) => `data: ${JSON.stringify(value)}\n\n`).join("") +
      "data: [DONE]\n\n",
  );
  let offset = 0;
  return new Response(
    new ReadableStream({
      pull(output) {
        if (offset === bytes.length) {
          output.close();
          return;
        }
        output.enqueue(bytes.slice(offset, offset + 1));
        offset++;
      },
    }),
    {
      headers: {
        "content-type": "text/event-stream",
        "x-workflow-run-id": "synthetic",
      },
    },
  );
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
for (const snapshot of [false, true])
  for (const method of ["send", "resume"] as const)
    for (const persisted of [false, true, "partial"] as const)
      for (let cut = 0; cut <= chunks.length; cut++)
        it(`canonical continuation ${method} snapshot=${snapshot} persisted=${persisted} cut=${cut}`, async () => {
          vi.stubEnv("NODE_ENV", "development");
          vi.stubEnv("VERCEL_ENV", "development");
          vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
          vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
          const pieces = [chunks.slice(0, cut), chunks.slice(cut)];
          const cursors: number[] = [];
          let calls = 0;
          const fetch = vi.fn(async (input: unknown, init?: RequestInit) => {
            const url = new URL(String(input));
            expect(url.origin).toBe("https://recoup.invalid");
            expect(
              new Headers(init?.headers).get("X-Recoup-Stream-Continuation"),
            ).toBe("canonical-base-v1");
            expect(new Headers(init?.headers).get("Authorization")).toBe(
              "Bearer synthetic",
            );
            if (method === "send" && calls === 0) {
              expect(init?.method).toBe("POST");
              expect(url.pathname).toBe("/api/chat");
            } else {
              expect(init?.method ?? "GET").toBe("GET");
              expect(url.pathname).toBe(`/api/chat/${hostScope.chatId}/stream`);
              cursors.push(Number(url.searchParams.get("startIndex")));
            }
            if (calls >= pieces.length) throw Error("Unexpected retry");
            return response(pieces[calls++]);
          });
          vi.stubGlobal("fetch", fetch);
          const consumer = snapshot
            ? createSnapshotConsumer(() => hostScope)
            : undefined;
          consumer?.syncScope();
          const onError = vi.fn(),
            onFinish = vi.fn(),
            onData = vi.fn();
          const transport = createWorkflowChatTransport({
            baseUrl: "https://recoup.invalid",
            continuationProtocol: "canonical-base-v1",
            getIds: () => ({
              chatId: hostScope.chatId,
              sessionId: hostScope.sessionId,
            }),
            getAccessToken: async () => "synthetic",
            snapshotConsumer: consumer,
            getMessages: () => chat.messages,
          });
          const chat: ResumableChat = new ResumableChat({
            id: hostScope.chatId,
            messages: [
              structuredClone(
                persisted === "partial"
                  ? {
                      ...fixture.result.responseMessage,
                      parts: fixture.result.responseMessage.parts.slice(0, 4),
                    }
                  : persisted
                    ? fixture.result.responseMessage
                    : fixture.seed,
              ) as UIMessage,
            ],
            transport,
            onError,
            onFinish,
            onData,
          });
          if (method === "send") await chat.sendMessage();
          else await chat.resumeStream();
          expect(onError).not.toHaveBeenCalled();
          expect(chat.status).toBe("ready");
          expect(json(chat.messages)).toEqual([fixture.result.responseMessage]);
          expect(cursors).toEqual(
            method === "send"
              ? cut === chunks.length
                ? []
                : [cut]
              : cut === chunks.length
                ? [0]
                : [0, cut],
          );
          expect(onFinish).toHaveBeenCalledTimes(1);
          expect(json(onFinish.mock.calls[0][0].message)).toEqual(
            fixture.result.responseMessage,
          );
          expect(onData).toHaveBeenCalledTimes(2);
        });
it.each(["send", "resume"] as const)(
  "upgrade-required is terminal for %s without resubmit",
  async (method) => {
    const fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ code: "stream_continuation_upgrade_required" }),
          { status: 409 },
        ),
    );
    vi.stubGlobal("fetch", fetch);
    const onError = vi.fn();
    const chat = new ResumableChat({
      messages: [fixture.seed as UIMessage],
      onError,
      transport: createWorkflowChatTransport({
        baseUrl: "https://recoup.invalid",
        continuationProtocol: "canonical-base-v1",
        getIds: () => ({ chatId: "chat", sessionId: undefined }),
        getAccessToken: async () => "synthetic",
      }),
    });
    if (method === "send") await chat.sendMessage();
    else await chat.resumeStream();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(chat.status).toBe("error");
    expect(onError).toHaveBeenCalledTimes(1);
    expect(chat.messages).toEqual([fixture.seed]);
  },
);
it("a transport with no capable consumer does not advertise", async () => {
  const fetch = vi.fn(async (_url: unknown, init?: RequestInit) => {
    expect(new Headers(init?.headers).has("X-Recoup-Stream-Continuation")).toBe(
      false,
    );
    return response([{ type: "finish" }]);
  });
  vi.stubGlobal("fetch", fetch);
  const transport = createWorkflowChatTransport({
    baseUrl: "https://recoup.invalid",
    getIds: () => ({ chatId: "chat", sessionId: undefined }),
    getAccessToken: async () => "synthetic",
  });
  const stream = await transport.reconnectToStream({ chatId: "chat" });
  const reader = stream!.getReader();
  while (!(await reader.read()).done) {}
  expect(fetch).toHaveBeenCalledTimes(1);
});

it.each([
  [503, "stream_continuation_evidence_unavailable"],
  [409, "chat_stream_ownership_lost"],
])(
  "does not reject or resubmit a POST that was admitted before readback failed (%s)",
  async (status, error) => {
    const fetch = vi.fn(async () =>
      Response.json(
        {
          status: "error",
          error,
          admission: "admitted",
          runId: "synthetic-run",
        },
        { status },
      ),
    );
    vi.stubGlobal("fetch", fetch);
    const lifecycle = createChatRequestLifecycle(),
      onAccepted = vi.fn(),
      onRejected = vi.fn(),
      onError = vi.fn();
    const chat = new ResumableChat({
      messages: [fixture.seed as UIMessage],
      onError,
      transport: createWorkflowChatTransport({
        baseUrl: "https://recoup.invalid",
        continuationProtocol: "canonical-base-v1",
        requestLifecycle: lifecycle,
        getIds: () => ({ chatId: "chat", sessionId: "session" }),
        getAccessToken: async () => "synthetic",
      }),
    });
    await chat.sendMessage(undefined, {
      metadata: { isCurrent: () => true, onAccepted, onRejected },
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(onAccepted).toHaveBeenCalledExactlyOnceWith({
      chatId: "chat",
      sessionId: "session",
    });
    expect(onRejected).not.toHaveBeenCalled();
    expect(lifecycle.hasUnknownAdmission()).toBe(false);
    expect(chat.status).toBe("error");
    expect(onError).toHaveBeenCalledTimes(1);
  },
);
