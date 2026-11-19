import { afterEach, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import type { UIMessage } from "ai";
import artifact from "../__fixtures__/continuation-v1/producer-5bc0b429.json";
import { ResumableChat } from "../ResumableChat";
import { createWorkflowChatTransport } from "../createWorkflowChatTransport";
import { createSnapshotConsumer } from "@/lib/intelligent-ui/chat/createSnapshotConsumer";
import { hostScope } from "@/lib/intelligent-ui/transport/__tests__/chatSnapshotFixture";
const json = (value: unknown) => JSON.parse(JSON.stringify(value));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
function response(wire: string) {
  const bytes = new TextEncoder().encode(wire);
  let index = 0;
  return new Response(
    new ReadableStream({
      pull(c) {
        if (index === bytes.length) {
          c.close();
          return;
        }
        c.enqueue(bytes.slice(index, index + 1));
        index++;
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
it("pins actual API5bc0b429 producer bytes", () => {
  expect(
    createHash("sha256")
      .update(
        readFileSync(
          new URL(
            "../__fixtures__/continuation-v1/producer-5bc0b429.json",
            import.meta.url,
          ),
        ),
      )
      .digest("hex"),
  ).toBe("5fa3bbd622c4d1643718786bb74b1927f7cbfbdc85c0c25e58aa5a788eccd09e");
});
for (const [caseIndex, fixture] of artifact.cases.entries())
  for (const snapshot of [false, true])
    for (const method of ["send", "resume"] as const)
      for (const history of ["original", "partial", "full"] as const)
        for (let cut = 0; cut <= fixture.chunks.length; cut++)
          it(`actual API case=${caseIndex} snapshot=${snapshot} ${method} history=${history} cut=${cut}`, async () => {
            vi.stubEnv("NODE_ENV", "development");
            vi.stubEnv("VERCEL_ENV", "development");
            vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
            vi.stubEnv(
              "NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT",
              String(snapshot),
            );
            const frames = fixture.wire.match(/[\s\S]*?\n\n/g)!;
            expect(frames.join("")).toBe(fixture.wire);
            const pieces =
              cut === fixture.chunks.length
                ? [fixture.wire]
                : [frames.slice(0, cut).join(""), frames.slice(cut).join("")];
            let calls = 0;
            const cursors: number[] = [];
            vi.stubGlobal(
              "fetch",
              vi.fn(async (input: unknown, init?: RequestInit) => {
                const url = new URL(String(input));
                expect(url.origin).toBe("https://recoup.invalid");
                expect(
                  new Headers(init?.headers).get(
                    "X-Recoup-Stream-Continuation",
                  ),
                ).toBe("canonical-base-v1");
                expect(new Headers(init?.headers).get("Authorization")).toBe(
                  "Bearer synthetic",
                );
                if (method === "send" && calls === 0) {
                  expect(init?.method).toBe("POST");
                  expect(url.pathname).toBe("/api/chat");
                } else {
                  expect(init?.method ?? "GET").toBe("GET");
                  expect(url.pathname).toBe(
                    `/api/chat/${hostScope.chatId}/stream`,
                  );
                  cursors.push(Number(url.searchParams.get("startIndex")));
                }
                if (calls >= pieces.length) throw Error("Unexpected request");
                return response(pieces[calls++]);
              }),
            );
            const consumer = snapshot
              ? createSnapshotConsumer(() => hostScope)
              : undefined;
            consumer?.syncScope();
            const initial =
              history === "original"
                ? fixture.seed
                : history === "full"
                  ? fixture.result.responseMessage
                  : {
                      ...fixture.result.responseMessage,
                      parts: fixture.result.responseMessage.parts.slice(
                        0,
                        fixture.seed.parts.length + 3,
                      ),
                    };
            const onError = vi.fn(),
              onFinish = vi.fn();
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
              messages: [structuredClone(initial) as UIMessage],
              transport,
              onError,
              onFinish,
            });
            if (method === "send") await chat.sendMessage();
            else await chat.resumeStream();
            expect(onError).not.toHaveBeenCalled();
            expect(chat.status).toBe("ready");
            expect(json(chat.messages)).toEqual([
              fixture.result.responseMessage,
            ]);
            expect(onFinish).toHaveBeenCalledTimes(1);
            expect(cursors).toEqual(
              method === "send"
                ? cut === fixture.chunks.length
                  ? []
                  : [cut]
                : cut === fixture.chunks.length
                  ? [0]
                  : [0, cut],
            );
            for (const [index, part] of chat.messages[0].parts.entries())
              if (part.type === "data-recoup-sdk-observation") {
                const data = part.data as {
                  fallback: { partIndex: number; text: string };
                };
                expect(data.fallback.partIndex).toBe(index + 1);
                expect(chat.messages[0].parts[index + 1]).toMatchObject({
                  type: "text",
                  text: data.fallback.text,
                });
              }
          });
