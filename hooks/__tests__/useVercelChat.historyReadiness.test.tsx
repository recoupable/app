// @vitest-environment jsdom
import React from "react";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import {
  createUIMessageStreamResponse,
  type UIMessage,
  type UIMessageChunk,
} from "ai";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useVercelChat } from "../useVercelChat";
import { MessageParts } from "@/components/VercelChat/MessageParts";
import { VercelChatContext } from "@/providers/VercelChatProvider";
import * as transportFactory from "@/lib/chat/createWorkflowChatTransport";
import {
  chatSnapshotPart,
  hostScope,
} from "@/lib/intelligent-ui/transport/__tests__/chatSnapshotFixture";
import { workflowResponse } from "@/lib/intelligent-ui/transport/__tests__/workflowResponse";

const prospectiveScope = React.createContext<{
  organizationId?: string;
  artistId?: string;
}>({});

const external = vi.hoisted(() => ({
  organizationId: "synthetic-workspace",
  getAccessToken: vi.fn(async (): Promise<string | null> => "synthetic-token"),
  refetchCredits: vi.fn(async () => {}),
  persistModel: vi.fn(async () => {}),
  files: [],
}));
// Keep useVercelChat, useMessageLoader, useChatTransport, SDK Chat/useChat and
// MessageParts real. Only external providers and unrelated presentation adapters
// are isolated; every request below is synthetic and allowlisted by the fixture.
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    authenticated: true,
    user: { id: "synthetic-actor" },
    getAccessToken: external.getAccessToken,
  }),
}));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: "synthetic-account" } }),
}));
vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => ({
    selectedArtist: {
      account_id:
        React.useContext(prospectiveScope).artistId ?? "synthetic-artist",
    },
  }),
}));
vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => ({
    selectedOrgId:
      React.useContext(prospectiveScope).organizationId ??
      external.organizationId,
  }),
}));
vi.mock("@/providers/AccountOverrideProvider", () => ({
  useAccountOverride: () => ({ accountIdOverride: null }),
}));
vi.mock("@/providers/PaymentProvider", () => ({
  usePaymentProvider: () => ({ refetchCredits: external.refetchCredits }),
}));
vi.mock("@/providers/ConversationsProvider", () => ({
  useConversationsProvider: () => ({ addOptimisticConversation: vi.fn() }),
}));
vi.mock("@/hooks/useAvailableModels", () => ({
  default: () => ({ data: [] }),
}));
vi.mock("@/hooks/useArtistFilesForMentions", () => ({
  default: () => ({ files: external.files }),
}));
vi.mock("@/hooks/usePersistSelectedModel", () => ({
  usePersistSelectedModel: () => external.persistModel,
}));
vi.mock("@/hooks/useDeleteTrailingMessages", () => ({
  useDeleteTrailingMessages: () => ({ deleteTrailingMessages: vi.fn() }),
}));
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => "https://recoup.invalid",
}));
vi.mock("next/navigation", () => ({
  useParams: () => ({ chatId: "synthetic-chat" }),
}));
vi.mock("@/providers/VercelChatProvider", async () => {
  const { createContext } = await import("react");
  return { VercelChatContext: createContext(undefined) };
});
vi.mock("@/components/VercelChat/ViewingMessage", () => ({
  default: ({ partText }: { partText: string }) => <p>{partText}</p>,
}));
vi.mock("@/components/VercelChat/EditingMessage", () => ({
  default: () => null,
}));
vi.mock("@/components/VercelChat/ToolComponents", () => ({
  getToolCallComponent: () => null,
  getToolResultComponent: () => null,
}));
vi.mock("@/components/VercelChat/message-file-viewer", () => ({
  default: () => null,
}));
vi.mock("@/components/reasoning/EnhancedReasoning", () => ({
  EnhancedReasoning: () => null,
}));

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
  external.organizationId = hostScope.workspaceId;
  external.getAccessToken.mockResolvedValue("synthetic-token");
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function pendingResponse() {
  let resolve!: (response: Response) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<Response>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function mount() {
  let latest!: ReturnType<typeof useVercelChat>;
  const factory = vi.spyOn(transportFactory, "createWorkflowChatTransport");
  function Harness() {
    latest = useVercelChat({
      id: hostScope.chatId,
      sessionId: hostScope.sessionId,
    });
    return (
      <VercelChatContext.Provider
        value={
          { ...latest } as unknown as React.ContextType<
            typeof VercelChatContext
          >
        }
      >
        {latest.messages.map((message) => (
          <section
            data-testid="message"
            data-message-id={message.id}
            key={message.id}
          >
            <MessageParts message={message} mode="view" setMode={() => {}} />
          </section>
        ))}
      </VercelChatContext.Provider>
    );
  }
  const view = render(<Harness />);
  return {
    ...view,
    rerenderScope: () => view.rerender(<Harness />),
    current: () => latest,
    getMessages: () => factory.mock.calls.at(-1)![0].getMessages!(),
  };
}

const historyUrl = `https://recoup.invalid/api/sessions/${hostScope.sessionId}/chats/${hostScope.chatId}`;
const streamUrl = `https://recoup.invalid/api/chat/${hostScope.chatId}/stream?startIndex=0&streamLifecycle=explicit-stop-v1`;
const saved: UIMessage = {
  id: "saved-assistant",
  role: "assistant",
  parts: [
    { type: "text", text: "Original canonical explanation." },
    chatSnapshotPart(1, "Previously accepted response."),
  ],
};

function concurrentHarness() {
  let committed!: ReturnType<typeof useVercelChat>;
  let selectedScope!: React.Dispatch<
    React.SetStateAction<{ organizationId: string; artistId: string }>
  >;
  let suspendedRenders = 0;
  const pending = new Promise<void>(() => {});
  function ChatPage() {
    const scope = React.useContext(prospectiveScope);
    const chat = useVercelChat({
      id: hostScope.chatId,
      sessionId: hostScope.sessionId,
    });
    React.useLayoutEffect(() => {
      committed = chat;
    });
    if (
      scope.organizationId !== hostScope.workspaceId ||
      scope.artistId !== hostScope.subject.id
    ) {
      suspendedRenders++;
      throw pending;
    }
    return (
      <VercelChatContext.Provider
        value={
          { ...chat } as unknown as React.ContextType<typeof VercelChatContext>
        }
      >
        <div data-testid="committed-scope">
          {scope.organizationId}:{scope.artistId}
        </div>
        {chat.messages.map((message) => (
          <MessageParts
            key={message.id}
            message={message}
            mode="view"
            setMode={() => {}}
          />
        ))}
      </VercelChatContext.Provider>
    );
  }
  function Harness() {
    const [scope, setScope] = React.useState({
      organizationId: hostScope.workspaceId,
      artistId: hostScope.subject.id,
    });
    selectedScope = setScope;
    return (
      <React.Suspense fallback={<p>Pending scope</p>}>
        <prospectiveScope.Provider value={scope}>
          <ChatPage />
        </prospectiveScope.Provider>
      </React.Suspense>
    );
  }
  return {
    ...render(<Harness />),
    current: () => committed,
    transition: (scope: { organizationId: string; artistId: string }) =>
      React.startTransition(() => selectedScope(scope)),
    abandon: () =>
      selectedScope({
        organizationId: hostScope.workspaceId,
        artistId: hostScope.subject.id,
      }),
    suspendedRenders: () => suspendedRenders,
  };
}

it.each(["organizationId", "artistId"] as const)(
  "preserves the committed stream and accepted answer when a concurrent %s transition suspends and is abandoned",
  async (field) => {
    let controller!: ReadableStreamDefaultController<UIMessageChunk>;
    const source = new ReadableStream<UIMessageChunk>({
      start(c) {
        controller = c;
      },
    });
    let streamSignal: AbortSignal | undefined;
    const fetch = vi.fn().mockImplementation(async (url, init) => {
      if (url === historyUrl)
        return Response.json({ messages: [structuredClone(saved)] });
      if (url === streamUrl) {
        streamSignal = init.signal;
        return createUIMessageStreamResponse({
          stream: source,
          headers: { "x-workflow-run-id": "synthetic-run" },
        });
      }
      throw new Error(`Unexpected synthetic URL: ${url}`);
    });
    vi.stubGlobal("fetch", fetch);
    const harness = concurrentHarness();
    await waitFor(() => expect(streamSignal).toBeDefined());
    await act(async () => {
      controller.enqueue(
        chatSnapshotPart(2, "Committed answer before transition."),
      );
    });
    await screen.findByText("Committed answer before transition.");
    const binding = harness.current().intelligentUI!;
    await act(async () => {
      harness.transition({
        organizationId: hostScope.workspaceId,
        artistId: hostScope.subject.id,
        [field]: "speculative-scope",
      });
    });
    expect(harness.suspendedRenders()).toBeGreaterThan(0);
    expect(screen.getByTestId("committed-scope").textContent).toBe(
      `${hostScope.workspaceId}:${hostScope.subject.id}`,
    );
    expect(screen.queryByText("Pending scope")).toBeNull();
    expect(streamSignal!.aborted).toBe(false);
    expect(
      binding.consumer.getSnapshot(
        "saved-assistant",
        "synthetic-summary",
        binding.scopeKey,
      )?.revision,
    ).toBe(2);
    // Committed callbacks must keep using A while React is still attempting B.
    await act(async () => {
      controller.enqueue(
        chatSnapshotPart(3, "Committed update during suspension."),
      );
    });
    await screen.findByText("Committed update during suspension.");
    expect(streamSignal!.aborted).toBe(false);
    await act(async () => {
      harness.abandon();
    });
    expect(
      screen.getByText("Committed update during suspension."),
    ).toBeTruthy();
    await act(async () => {
      controller.enqueue(
        chatSnapshotPart(4, "Committed answer keeps streaming."),
      );
      controller.enqueue({ type: "finish" });
      controller.close();
    });
    await screen.findByText("Committed answer keeps streaming.");
    expect(harness.current().messages.map((message) => message.id)).toEqual([
      "saved-assistant",
    ]);
    expect(harness.current().intelligentUI?.scopeKey).toBe(binding.scopeKey);
    expect(fetch.mock.calls.filter(([url]) => url === historyUrl)).toHaveLength(
      1,
    );
    expect(fetch.mock.calls.filter(([url]) => url === streamUrl)).toHaveLength(
      1,
    );
  },
);

it("installs committed history and resumes A while an uncommitted B scope is suspended", async () => {
  const history = pendingResponse();
  const fetch = vi.fn().mockImplementation(async (url) => {
    if (url === historyUrl) return history.promise;
    if (url === streamUrl)
      return workflowResponse([
        { type: "text-start", id: "continuation" },
        {
          type: "text-delta",
          id: "continuation",
          delta: "Committed A continuation.",
        },
        { type: "text-end", id: "continuation" },
        chatSnapshotPart(2, "Committed A history remains available."),
        { type: "finish" },
      ]);
    throw new Error(`Unexpected synthetic URL: ${url}`);
  });
  vi.stubGlobal("fetch", fetch);
  const harness = concurrentHarness();
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  await act(async () => {
    harness.transition({
      organizationId: "speculative-workspace",
      artistId: hostScope.subject.id,
    });
  });
  expect(harness.suspendedRenders()).toBeGreaterThan(0);
  await act(async () => {
    history.resolve(Response.json({ messages: [structuredClone(saved)] }));
  });
  await screen.findByText("Committed A history remains available.");
  expect(screen.getByText("Original canonical explanation.")).toBeTruthy();
  expect(screen.getByText("Committed A continuation.")).toBeTruthy();
  expect(harness.current().messages.map((message) => message.id)).toEqual([
    "saved-assistant",
  ]);
  expect(screen.getByTestId("committed-scope").textContent).toBe(
    `${hostScope.workspaceId}:${hostScope.subject.id}`,
  );
  await act(async () => {
    harness.abandon();
  });
  expect(
    screen.getByText("Committed A history remains available."),
  ).toBeTruthy();
  expect(fetch.mock.calls.filter(([url]) => url === historyUrl)).toHaveLength(
    1,
  );
  expect(fetch.mock.calls.filter(([url]) => url === streamUrl)).toHaveLength(1);
});

it("blocks text-first cold resume until history installs, replacing a stale NONEMPTY getter before one saved assistant receives prose and UI", async () => {
  const history = pendingResponse();
  // Ordinary text bytes are ready before history, matching the independent
  // text-first probe. The owning hook must not dispatch resume yet.
  const response = workflowResponse([
    { type: "text-start", id: "intro" },
    {
      type: "text-delta",
      id: "intro",
      delta: "The resumed explanation begins.",
    },
    { type: "text-end", id: "intro" },
    chatSnapshotPart(2, "New accepted response."),
    { type: "finish" },
  ]);
  let beforeResume: UIMessage[] | undefined;
  const fetch = vi.fn().mockImplementation(async (url) => {
    if (url === historyUrl) return history.promise;
    if (url === streamUrl) {
      beforeResume = harness.getMessages();
      return response;
    }
    throw new Error(`Unexpected synthetic URL: ${url}`);
  });
  vi.stubGlobal("fetch", fetch);
  const harness = mount();
  await waitFor(() =>
    expect(fetch.mock.calls.filter(([url]) => url === historyUrl)).toHaveLength(
      1,
    ),
  );
  await act(async () => {
    harness.current().setMessages([
      {
        id: "previous-local-assistant",
        role: "assistant",
        parts: [{ type: "text", text: "Preceding nonempty local view." }],
      },
    ]);
  });
  const stale = harness.getMessages();
  expect(stale.at(-1)?.id).toBe("previous-local-assistant");
  expect(fetch.mock.calls.filter(([url]) => url === streamUrl)).toHaveLength(0);
  expect(screen.queryByText("The resumed explanation begins.")).toBeNull();
  expect(harness.current().messages.map((message) => message.id)).toEqual([
    "previous-local-assistant",
  ]);
  await act(async () => {
    history.resolve(Response.json({ messages: [structuredClone(saved)] }));
  });
  await screen.findByText("New accepted response.");
  await screen.findByRole("article", { name: "Recoup response" });
  expect(beforeResume?.at(-1)?.id).toBe("saved-assistant");
  expect(beforeResume).not.toBe(stale);
  expect(stale.at(-1)?.id).toBe("previous-local-assistant");
  expect(harness.current().messages.map((message) => message.id)).toEqual([
    "saved-assistant",
  ]);
  expect(harness.current().messages[0].parts).toEqual([
    { type: "text", text: "Original canonical explanation." },
    chatSnapshotPart(2, "New accepted response."),
    { type: "text", text: "The resumed explanation begins.", state: "done" },
  ]);
  expect(screen.getAllByTestId("message")).toHaveLength(1);
  expect(screen.getByTestId("message").getAttribute("data-message-id")).toBe(
    "saved-assistant",
  );
  expect(screen.getAllByText("Original canonical explanation.")).toHaveLength(
    1,
  );
  expect(screen.getAllByText("The resumed explanation begins.")).toHaveLength(
    1,
  );
  expect(fetch.mock.calls.filter(([url]) => url === streamUrl)).toHaveLength(1);
});

it("settles successful empty history before dispatching resume", async () => {
  const history = pendingResponse();
  const fetch = vi.fn().mockImplementation(async (url) => {
    if (url === historyUrl) return history.promise;
    if (url === streamUrl) return workflowResponse([{ type: "finish" }]);
    throw new Error(`Unexpected synthetic URL: ${url}`);
  });
  vi.stubGlobal("fetch", fetch);
  const harness = mount();
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  expect(fetch.mock.calls.filter(([url]) => url === streamUrl)).toHaveLength(0);
  await act(async () => {
    history.resolve(Response.json({ messages: [] }));
  });
  await waitFor(() =>
    expect(fetch.mock.calls.filter(([url]) => url === streamUrl)).toHaveLength(
      1,
    ),
  );
  expect(harness.current().messages).toEqual([]);
  expect(harness.current().status).toBe("ready");
});

it("does not treat a failed history load as resume readiness", async () => {
  const history = pendingResponse();
  vi.spyOn(console, "error").mockImplementation(() => {});
  const fetch = vi.fn().mockImplementation(async (url) => {
    if (url === historyUrl) return history.promise;
    throw new Error(`Unexpected resume after failed history: ${url}`);
  });
  vi.stubGlobal("fetch", fetch);
  const harness = mount();
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  await act(async () => {
    history.reject(new Error("Synthetic history failure"));
  });
  await waitFor(() => expect(harness.current().hasError).toBe(true));
  expect(fetch.mock.calls.filter(([url]) => url === streamUrl)).toHaveLength(0);
  expect(harness.current().messages).toEqual([]);
});

it.each([401, 403, 500])(
  "does not treat an HTTP %s history failure as successful empty history",
  async (status) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetch = vi.fn().mockImplementation(async (url) => {
      if (url === historyUrl) return new Response(null, { status });
      throw new Error(`Unexpected resume after HTTP failure: ${url}`);
    });
    vi.stubGlobal("fetch", fetch);
    const harness = mount();
    await waitFor(() => expect(harness.current().hasError).toBe(true));
    expect(fetch.mock.calls.filter(([url]) => url === streamUrl)).toHaveLength(
      0,
    );
    expect(harness.current().messages).toEqual([]);
  },
);

it("does not resume when history cannot acquire an access token", async () => {
  external.getAccessToken.mockResolvedValueOnce(null);
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const harness = mount();
  await waitFor(() => expect(harness.current().isLoading).toBe(false));
  expect(fetch).not.toHaveBeenCalled();
  expect(harness.current().messages).toEqual([]);
});

it.each([true, false])(
  "ignores an old-scope history result before SDK state or readiness can publish (UI=%s)",
  async (enabled) => {
    vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", String(enabled));
    const previous = pendingResponse();
    const current = pendingResponse();
    let requests = 0;
    const fetch = vi.fn().mockImplementation(async (url) => {
      if (url === historyUrl)
        return ++requests === 1 ? previous.promise : current.promise;
      if (url === streamUrl) return workflowResponse([{ type: "finish" }]);
      throw new Error(`Unexpected synthetic URL: ${url}`);
    });
    vi.stubGlobal("fetch", fetch);
    const harness = mount();
    await waitFor(() => expect(requests).toBe(1));
    external.organizationId = "another-workspace";
    harness.rerenderScope();
    await waitFor(() => expect(requests).toBe(2));
    await act(async () => {
      previous.resolve(Response.json({ messages: [saved] }));
    });
    expect(harness.current().messages).toEqual([]);
    expect(harness.getMessages()).toEqual([]);
    expect(fetch.mock.calls.filter(([url]) => url === streamUrl)).toHaveLength(
      0,
    );
    await act(async () => {
      current.resolve(Response.json({ messages: [] }));
    });
    await waitFor(() =>
      expect(
        fetch.mock.calls.filter(([url]) => url === streamUrl),
      ).toHaveLength(1),
    );
    expect(harness.current().messages).toEqual([]);
  },
);

it.each(
  ["stop", "unmount"].flatMap((reason) =>
    [true, false].map((enabled) => ({ reason, enabled })),
  ),
)(
  "cannot revive a pending initial resume after $reason when history completes (UI=$enabled)",
  async ({ reason, enabled }) => {
    vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", String(enabled));
    const history = pendingResponse();
    const fetch = vi.fn().mockImplementation(async (url) => {
      if (url === historyUrl) return history.promise;
      if (url === `https://recoup.invalid/api/chat/${hostScope.chatId}/stop`)
        return Response.json({ success: true, stopped: false });
      throw new Error(`Unexpected resume after ${reason}: ${url}`);
    });
    vi.stubGlobal("fetch", fetch);
    const harness = mount();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    if (reason === "stop")
      await act(async () => {
        await harness.current().stop();
      });
    else harness.unmount();
    await act(async () => {
      history.resolve(Response.json({ messages: [saved] }));
    });
    expect(fetch.mock.calls.filter(([url]) => url === streamUrl)).toHaveLength(
      0,
    );
    if (reason === "stop") {
      expect(harness.current().status).toBe("ready");
      expect(harness.current().messages.map((message) => message.id)).toEqual([
        "saved-assistant",
      ]);
      expect(screen.getByText("Original canonical explanation.")).toBeTruthy();
    } else expect(harness.getMessages()).toEqual([]);
  },
);

it.each(
  ["send", "retry", "append"].flatMap((action) =>
    [true, false].flatMap((enabled) =>
      [true, false].map((failed) => ({ action, enabled, failed })),
    ),
  ),
)(
  "does not replace an intentional $action with history that was already pending (UI=$enabled, failed=$failed)",
  async ({ action, enabled, failed }) => {
    vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", String(enabled));
    const history = pendingResponse();
    const fetch = vi.fn().mockImplementation(async (url) => {
      if (url === historyUrl) return history.promise;
      if (
        url ===
        "https://recoup.invalid/api/chat?streamLifecycle=explicit-stop-v1"
      )
        return workflowResponse([
          { type: "start", messageId: "new-intent-assistant" },
          { type: "text-start", id: "intent" },
          {
            type: "text-delta",
            id: "intent",
            delta: "New intentional response.",
          },
          { type: "text-end", id: "intent" },
          { type: "finish" },
        ]);
      throw new Error(`Unexpected synthetic URL: ${url}`);
    });
    vi.stubGlobal("fetch", fetch);
    const harness = mount();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    await act(async () => {
      harness.current().setMessages([
        {
          id: "existing-user",
          role: "user",
          parts: [{ type: "text", text: "Existing question." }],
        },
        {
          id: "existing-assistant",
          role: "assistant",
          parts: [{ type: "text", text: "Existing answer." }],
        },
      ]);
      harness.current().setInput("New intentional question.");
    });
    await act(async () => {
      if (action === "send")
        await harness.current().handleSendMessage({
          preventDefault() {},
        } as React.FormEvent<HTMLFormElement>);
      else if (action === "retry") await harness.current().reload();
      else
        await harness.current().append({
          id: "new-user",
          role: "user",
          parts: [{ type: "text", text: "New intentional question." }],
        });
    });
    await screen.findByText("New intentional response.");
    await waitFor(() => expect(harness.current().status).toBe("ready"));
    const newMessages = structuredClone(harness.current().messages);
    await act(async () => {
      history.resolve(
        failed
          ? new Response(null, { status: 503 })
          : Response.json({ messages: [saved] }),
      );
    });
    expect(harness.current().hasError).toBe(false);
    expect(harness.current().messages).toEqual(newMessages);
    expect(harness.getMessages()).toEqual(newMessages);
    expect(screen.getByText("New intentional response.")).toBeTruthy();
    expect(screen.queryByText("Original canonical explanation.")).toBeNull();
    expect(fetch.mock.calls.filter(([url]) => url === streamUrl)).toHaveLength(
      0,
    );
    expect(fetch.mock.calls.filter(([url]) => url === historyUrl)).toHaveLength(
      1,
    );
  },
);

it.each(["development-default", "production-flag-true"])(
  "orders default history before resume and recovers a failed read (%s)",
  async (environment) => {
    if (environment === "production-flag-true")
      vi.stubEnv("NODE_ENV", "production");
    else vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "false");
    vi.spyOn(console, "error").mockImplementation(() => {});
    const history = pendingResponse();
    let reads = 0;
    const fetch = vi.fn().mockImplementation(async (url) => {
      if (url === historyUrl)
        return ++reads === 1
          ? history.promise
          : Response.json({ messages: [saved] });
      if (url === streamUrl) return new Response(null, { status: 204 });
      throw new Error(`Unexpected URL: ${url}`);
    });
    vi.stubGlobal("fetch", fetch);
    const harness = mount();
    await waitFor(() => expect(reads).toBe(1));
    expect(fetch.mock.calls.filter(([url]) => url === streamUrl)).toHaveLength(
      0,
    );
    await act(async () => {
      history.resolve(new Response(null, { status: 503 }));
    });
    await waitFor(() => expect(harness.current().hasError).toBe(true));
    expect(harness.current().messages).toEqual([]);
    expect(harness.current().intelligentUI).toBeUndefined();
    await act(async () => {
      harness.current().retryHistory();
    });
    await screen.findByText("Original canonical explanation.");
    expect(harness.current().hasError).toBe(false);
    expect(reads).toBe(2);
    await waitFor(() =>
      expect(
        fetch.mock.calls.filter(([url]) => url === streamUrl),
      ).toHaveLength(1),
    );
    expect(
      fetch.mock.calls.every(
        ([, init]) => !init?.method || init.method === "GET",
      ),
    ).toBe(true);
  },
);

it.each([401, 403, 500, "network", "malformed", "no-token"])(
  "keeps default history failure distinct from empty (%s)",
  async (failure) => {
    vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "false");
    if (failure === "no-token") external.getAccessToken.mockResolvedValue(null);
    const fetch = vi.fn().mockImplementation(async (url) => {
      if (url !== historyUrl) throw new Error("Unexpected resume");
      if (failure === "network") throw new Error("Synthetic offline");
      if (failure === "malformed") return Response.json({});
      return new Response(null, {
        status: typeof failure === "number" ? failure : 500,
      });
    });
    vi.stubGlobal("fetch", fetch);
    const harness = mount();
    await waitFor(() => expect(harness.current().hasError).toBe(true));
    expect(harness.current().isLoading).toBe(false);
    expect(harness.current().messages).toEqual([]);
    expect(fetch.mock.calls.filter(([url]) => url === streamUrl)).toHaveLength(
      0,
    );
    if (failure === "no-token") expect(fetch).not.toHaveBeenCalled();
  },
);

it("accepts successful empty history and resumes only afterward on the default path", async () => {
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "false");
  const history = pendingResponse();
  const fetch = vi.fn().mockImplementation(async (url) => {
    if (url === historyUrl) return history.promise;
    if (url === streamUrl) return new Response(null, { status: 204 });
    throw new Error(`Unexpected URL: ${url}`);
  });
  vi.stubGlobal("fetch", fetch);
  const harness = mount();
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  expect(harness.current().isLoading).toBe(true);
  await act(async () => {
    history.resolve(Response.json({ messages: [] }));
  });
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  expect(harness.current().messages).toEqual([]);
  expect(harness.current().hasError).toBe(false);
  expect(harness.current().isLoading).toBe(false);
});

it("ignores a superseded default history error after the selected workspace changes", async () => {
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "false");
  const previous = pendingResponse();
  let reads = 0;
  const fetch = vi.fn().mockImplementation(async (url) => {
    if (url === historyUrl)
      return ++reads === 1
        ? previous.promise
        : Response.json({ messages: [saved] });
    if (url === streamUrl) return new Response(null, { status: 204 });
    throw new Error(`Unexpected URL: ${url}`);
  });
  vi.stubGlobal("fetch", fetch);
  const harness = mount();
  await waitFor(() => expect(reads).toBe(1));
  external.organizationId = "another-workspace";
  harness.rerenderScope();
  await screen.findByText("Original canonical explanation.");
  await act(async () => previous.resolve(new Response(null, { status: 403 })));
  expect(harness.current().hasError).toBe(false);
  expect(harness.current().messages[0].id).toBe("saved-assistant");
});
