import { afterEach, expect, it, vi } from "vitest";
import { ResumableChat } from "../ResumableChat";
import { createWorkflowChatTransport } from "../createWorkflowChatTransport";
import { createChatRequestLifecycle } from "../createChatRequestLifecycle";
import { classifyChatAdmissionFailure } from "../classifyChatAdmissionFailure";
const admitted = {
  status: "error",
  error: "stream_continuation_evidence_unavailable",
  admission: "admitted",
  runId: "run",
};
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
const invalidBodies: ReadonlyArray<readonly [string, () => string]> = [
  ["truncated", () => JSON.stringify(admitted).slice(0, -1)],
  ["malformed", () => "{not-json}"],
  [
    "oversized",
    () => JSON.stringify({ ...admitted, padding: "x".repeat(9000) }),
  ],
  ["missing run ID", () => JSON.stringify({ ...admitted, runId: undefined })],
  [
    "unknown outcome",
    () => JSON.stringify({ ...admitted, admission: "maybe" }),
  ],
];
it.each(invalidBodies)(
  "keeps %s error evidence unknown without acknowledging/rejecting/resending",
  async (_name, body) => {
    const fetch = vi.fn(async () => new Response(body(), { status: 503 }));
    vi.stubGlobal("fetch", fetch);
    const lifecycle = createChatRequestLifecycle(),
      onAccepted = vi.fn(),
      onRejected = vi.fn(),
      onUnknown = vi.fn();
    const chat = new ResumableChat({
      transport: createWorkflowChatTransport({
        baseUrl: "https://recoup.invalid",
        getIds: () => ({ chatId: "chat", sessionId: "session" }),
        getAccessToken: async () => "synthetic",
        requestLifecycle: lifecycle,
      }),
    });
    await chat.sendMessage(
      { text: "One request" },
      {
        metadata: { isCurrent: () => true, onAccepted, onRejected, onUnknown },
      },
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(onAccepted).not.toHaveBeenCalled();
    expect(onRejected).not.toHaveBeenCalled();
    expect(onUnknown).toHaveBeenCalledTimes(1);
    expect(lifecycle.hasUnknownAdmission()).toBe(true);
    expect(chat.messages).toHaveLength(1);
    expect(chat.status).toBe("error");
  },
);
it("retains explicit pre-admission rejection as a rejection", async () => {
  const response = Response.json(
    {
      status: "error",
      error: "stream_continuation_upgrade_required",
      admission: "not_admitted",
    },
    { status: 409 },
  );
  expect((await classifyChatAdmissionFailure(response)).outcome).toBe(
    "not_admitted",
  );
});
it("bounds stalled classification and cancels its reader", async () => {
  vi.useFakeTimers();
  const cancel = vi.fn();
  const result = classifyChatAdmissionFailure(
    new Response(new ReadableStream({ cancel }), { status: 503 }),
  );
  await vi.advanceTimersByTimeAsync(5000);
  expect((await result).outcome).toBe("unknown");
  expect(cancel).toHaveBeenCalledTimes(1);
});
it("retains at most8192 diagnostic bytes and never guesses from an admitted prefix", async () => {
  const result = await classifyChatAdmissionFailure(
    new Response(JSON.stringify(admitted) + " ".repeat(10000), { status: 503 }),
  );
  expect(result.outcome).toBe("unknown");
  expect(result.diagnostic.byteLength).toBeLessThanOrEqual(8192);
});
it.each(["stop", "scope"])(
  "does not publish a stale classification after %s",
  async (mode) => {
    const cancel = vi.fn();
    let reading = false;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            new ReadableStream({
              pull() {
                reading = true;
              },
              cancel,
            }),
            { status: 503 },
          ),
      ),
    );
    const lifecycle = createChatRequestLifecycle(),
      onAccepted = vi.fn(),
      onRejected = vi.fn(),
      onUnknown = vi.fn();
    let current = true;
    const chat = new ResumableChat({
      captureResumeScope: () => () => current,
      transport: createWorkflowChatTransport({
        baseUrl: "https://recoup.invalid",
        getIds: () => ({ chatId: "chat", sessionId: "session" }),
        getAccessToken: async () => "synthetic",
        requestLifecycle: lifecycle,
      }),
    });
    const pending = chat.sendMessage(
      { text: "Pending" },
      {
        metadata: {
          isCurrent: () => current,
          onAccepted,
          onRejected,
          onUnknown,
        },
      },
    );
    await vi.waitFor(() => expect(reading).toBe(true));
    if (mode === "scope") {
      current = false;
      lifecycle.cancelAll();
    } else await chat.stop();
    await pending;
    expect(onAccepted).not.toHaveBeenCalled();
    expect(onRejected).not.toHaveBeenCalled();
    expect(onUnknown).not.toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledTimes(1);
  },
);
