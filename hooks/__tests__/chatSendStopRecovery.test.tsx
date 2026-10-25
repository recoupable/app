// @vitest-environment jsdom
import React from "react";
import {
  act,
  cleanup,
  render,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import { Chat } from "@ai-sdk/react";
import { MessageEditor } from "@/components/VercelChat/message-editor";
import { ChatInput } from "@/components/VercelChat/ChatInput";
import NewChatBootstrap from "@/components/VercelChat/NewChatBootstrap";
import {
  createUIMessageStreamResponse,
  type UIMessage,
  type UIMessageChunk,
} from "ai";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  VercelChatProvider,
  VercelChatContext,
  useVercelChatContext,
} from "@/providers/VercelChatProvider";
import { createWorkflowChatTransport } from "@/lib/chat/createWorkflowChatTransport";
import { createChatRequestLifecycle } from "@/lib/chat/createChatRequestLifecycle";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const external = vi.hoisted(() => ({
  getAccessToken: vi.fn(async () => "synthetic-token"),
  refetchCredits: vi.fn<(scope?: string) => Promise<void>>(async () => {}),
  persistModel: vi.fn(async () => {}),
  deleteTrailing: vi.fn(async () => {}),
  updateChatState: vi.fn(),
  addOptimisticConversation: vi.fn(),
  toastError: vi.fn(),
  files: [],
  routeChatId: "chat" as string | undefined,
}));
const PaymentScopeContext = React.createContext("chat");
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    authenticated: true,
    user: { id: "actor" },
    getAccessToken: external.getAccessToken,
  }),
}));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: "account" } }),
}));
vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => ({
    selectedArtist: { account_id: "artist" },
    updateChatState: external.updateChatState,
  }),
}));
vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => ({ selectedOrgId: "org", isInitialized: true }),
}));
vi.mock("@/providers/AccountOverrideProvider", () => ({
  useAccountOverride: () => ({ accountIdOverride: null }),
}));
vi.mock("@/providers/PaymentProvider", () => ({
  usePaymentProvider: () => {
    const scope = React.useContext(PaymentScopeContext);
    const refetchCredits = React.useCallback(
      () => external.refetchCredits(scope),
      [scope],
    );
    return { refetchCredits };
  },
}));
vi.mock("@/providers/ConversationsProvider", () => ({
  useConversationsProvider: () => ({
    addOptimisticConversation: external.addOptimisticConversation,
  }),
}));
// Keep the actual bootstrap, Chat wrapper, composer, provider and hooks. Only
// unrelated greeting/message presentation is replaced with a context probe.
vi.mock("@/components/VercelChat/messages", () => ({
  Messages: () => <BootstrapProbe />,
}));
vi.mock("@/components/Chat/ChatGreeting", () => ({
  default: () => <BootstrapProbe />,
}));
vi.mock("@/components/Valuation/ValuationRunStatusChip", () => ({
  default: () => null,
}));
vi.mock("@/hooks/useAvailableModels", () => ({
  default: () => ({ data: [] }),
}));
vi.mock("@/hooks/useArtistFilesForMentions", () => ({
  default: () => ({ files: external.files }),
}));
vi.mock("@/lib/sandboxes/getFileContents", () => ({
  getFileContents: vi.fn(() => {
    throw new Error("No file retrieval authorized");
  }),
}));
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => "https://recoup.invalid",
}));
vi.mock("next/navigation", () => ({
  useParams: () => ({ chatId: external.routeChatId }),
}));
vi.mock("react-toastify", () => ({ toast: { error: external.toastError } }));
const image = {
  type: "file" as const,
  mediaType: "image/png",
  filename: "draft.png",
  url: "data:image/png;base64,aW1hZ2U=",
};
const textFile = {
  filename: "draft.csv",
  content: "title,value\nexample,1",
  lineCount: 2,
  type: "csv" as const,
};
const event = () =>
  ({ preventDefault() {} }) as React.FormEvent<HTMLFormElement>;
const history: UIMessage[] = [
  {
    id: "saved-user",
    role: "user",
    parts: [{ type: "text", text: "Saved question" }],
  },
  {
    id: "saved-answer",
    role: "assistant",
    parts: [{ type: "text", text: "Saved answer" }],
  },
];
let bootstrapCurrent: ReturnType<typeof useVercelChatContext> | undefined;
function BootstrapProbe() {
  const context = useVercelChatContext();
  React.useLayoutEffect(() => {
    bootstrapCurrent = context;
  });
  return null;
}
function pending<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function response(chunks: UIMessageChunk[] = [{ type: "finish" }]) {
  return createUIMessageStreamResponse({
    stream: new ReadableStream({
      start(c) {
        chunks.forEach((x) => c.enqueue(x));
        c.close();
      },
    }),
    headers: { "x-workflow-run-id": "accepted-run" },
  });
}
function environment(dev = false) {
  vi.stubEnv("NODE_ENV", dev ? "development" : "test");
  vi.stubEnv("VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", dev ? "true" : "false");
}
beforeEach(() => {
  vi.clearAllMocks();
  external.getAccessToken.mockReset().mockResolvedValue("synthetic-token");
  vi.spyOn(console, "error").mockImplementation(() => {});
  localStorage.clear();
  external.routeChatId = "chat";
  bootstrapCurrent = undefined;
  environment();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
function fixture(
  post: (init: RequestInit) => Response | Promise<Response>,
  stop: () => Response | Promise<Response> = () =>
    Response.json({ success: true, stopped: true }),
  resume: () => Response = () => response(),
  bootstrap?: {
    session: () => Response | Promise<Response>;
    sandbox: () => Response | Promise<Response>;
  },
) {
  const calls: {
    url: URL;
    method: string;
    body?: { messages: UIMessage[] };
    authorization: string | null;
    signal?: AbortSignal | null;
  }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input, init: RequestInit = {}) => {
      const url = new URL(String(input));
      const method = init.method ?? "GET";
      calls.push({
        url,
        method,
        body: init.body ? JSON.parse(String(init.body)) : undefined,
        authorization: new Headers(init.headers).get("Authorization"),
        signal: init.signal,
      });
      if (url.pathname.startsWith("/api/sessions/") && method === "GET")
        return Response.json({ messages: structuredClone(history) });
      if (url.pathname.startsWith("/api/sessions/") && method === "PATCH")
        return Response.json({ status: "success" });
      if (url.pathname.endsWith("/stream")) return resume();
      if (url.pathname.endsWith("/stop")) return stop();
      if (url.pathname === "/api/chat" && method === "POST") return post(init);
      if (url.pathname === "/api/sessions" && method === "POST" && bootstrap)
        return bootstrap.session();
      if (url.pathname === "/api/sandbox" && method === "POST" && bootstrap)
        return bootstrap.sandbox();
      if (method === "DELETE") return new Response(null, { status: 204 });
      throw new Error(`Unexpected synthetic request ${method} ${url}`);
    }),
  );
  return {
    calls,
    posts: () => calls.filter((x) => x.url.pathname === "/api/chat"),
    stops: () => calls.filter((x) => x.url.pathname.endsWith("/stop")),
  };
}
async function mount(
  workspaceStatus: "ready" | "provisioning" = "ready",
  identity: { sessionId?: string; workflowChatId?: string } = {
    sessionId: "session",
  },
  initialMessages?: UIMessage[],
  waitUntilReady = true,
  renderComposer = false,
) {
  let current!: ReturnType<typeof useVercelChatContext>;
  function Consumer() {
    const context = useVercelChatContext();
    React.useLayoutEffect(() => {
      current = context;
    });
    return renderComposer ? <ChatInput /> : null;
  }
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const element = (
    chatId = "chat",
    workspace: typeof workspaceStatus = workspaceStatus,
    server = identity,
  ) => (
    <QueryClientProvider client={client}>
      <PaymentScopeContext value={chatId}>
        <VercelChatProvider
          chatId={chatId}
          sessionId={server.sessionId}
          workflowChatId={server.workflowChatId}
          initialMessages={initialMessages}
          workspaceStatus={workspace}
        >
          <Consumer />
        </VercelChatProvider>
      </PaymentScopeContext>
    </QueryClientProvider>
  );
  const view = render(element());
  if (identity.sessionId && external.routeChatId)
    await waitFor(() =>
      expect(current.messages.some((x) => x.id === "saved-user")).toBe(true),
    );
  if (!initialMessages && waitUntilReady)
    await waitFor(() => expect(current.status).toBe("ready"));
  return {
    ...view,
    client,
    current: () => current,
    switchIdentity: (server: typeof identity, workspace = workspaceStatus) =>
      view.rerender(element("chat", workspace, server)),
    switch: (id: string, workspace = workspaceStatus) =>
      view.rerender(element(id, workspace)),
  };
}
async function draft(h: Awaited<ReturnType<typeof mount>>) {
  act(() => {
    h.current().setInput("Retain this draft");
    h.current().setAttachments([image]);
    h.current().setTextAttachments([textFile]);
  });
}
async function mountBootstrap(initialMessages?: UIMessage[]) {
  external.routeChatId = undefined;
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const view = render(
    <QueryClientProvider client={client}>
      <NewChatBootstrap initialMessages={initialMessages} />
    </QueryClientProvider>,
  );
  await waitFor(() => expect(bootstrapCurrent).toBeDefined());
  return { ...view, current: () => bootstrapCurrent! };
}

it.each([409, 429, 503, 401, "network"])(
  "retains draft and both attachments on %s; manual retry sends once without DELETE",
  async (status) => {
    let rejected = true;
    const f = fixture(() => {
      if (!rejected) return response();
      if (status === "network") throw new TypeError("Network unavailable");
      return Response.json(
        { error: "Not accepted" },
        { status: Number(status) },
      );
    });
    const h = await mount();
    await draft(h);
    await act(async () => {
      await h.current().handleSendMessage(event());
    });
    expect(h.current().input).toBe("Retain this draft");
    expect(h.current().attachments).toEqual([image]);
    expect(h.current().textAttachments).toEqual([textFile]);
    expect(h.current().sendError).toBeTruthy();
    expect(h.current().messages.filter((x) => x.role === "user")).toHaveLength(
      1,
    );
    expect(f.posts()).toHaveLength(1);
    expect(f.calls.filter((x) => x.method === "DELETE")).toHaveLength(0);
    rejected = false;
    await act(async () => {
      await h.current().retrySendMessage?.(event());
    });
    expect(f.posts()).toHaveLength(2);
    expect(
      f.posts()[1].body!.messages.filter((x) => x.role === "user"),
    ).toHaveLength(2);
    expect(f.calls.filter((x) => x.method === "DELETE")).toHaveLength(0);
    expect(h.current().input).toBe("");
    expect(h.current().attachments).toEqual([]);
    expect(h.current().textAttachments).toEqual([]);
  },
);

it("clears only submitted identities at acceptance while preserving newer text and files", async () => {
  const admission = pending<Response>();
  const f = fixture(() => admission.promise);
  const h = await mount();
  await draft(h);
  let send!: Promise<void>;
  await act(async () => {
    send = h.current().handleSendMessage(event());
  });
  await waitFor(() => expect(f.posts()).toHaveLength(1));
  const nextImage = { ...image, filename: "next.png" };
  const nextText = { ...textFile, filename: "next.csv" };
  act(() => {
    h.current().setInput("Newer edit");
    h.current().setAttachments((prev) => [...prev, nextImage]);
    h.current().setTextAttachments((prev) => [...prev, nextText]);
  });
  await act(async () => {
    admission.resolve(response());
    await send;
  });
  expect(h.current().input).toBe("Newer edit");
  expect(h.current().attachments).toEqual([nextImage]);
  expect(h.current().textAttachments).toEqual([nextText]);
});

it.each([false, true])(
  "opts in and Stop confirms the captured server run (dev=%s)",
  async (dev) => {
    environment(dev);
    let reader!: ReadableStreamDefaultController<UIMessageChunk>;
    let signal: AbortSignal | null | undefined;
    const f = fixture((init) => {
      signal = init.signal;
      return createUIMessageStreamResponse({
        stream: new ReadableStream({
          start(c) {
            reader = c;
            c.enqueue({ type: "start", messageId: "active" });
          },
        }),
        headers: { "x-workflow-run-id": "accepted-run" },
      });
    });
    const h = await mount();
    expect(!!h.current().intelligentUI).toBe(dev);
    await draft(h);
    let send!: Promise<void>;
    await act(async () => {
      send = h.current().handleSendMessage(event());
    });
    await waitFor(() => expect(f.posts()).toHaveLength(1));
    await waitFor(() => expect(h.current().input).toBe(""));
    await act(async () => {
      await h.current().stop();
      reader.close();
      await send;
    });
    expect(f.stops()).toHaveLength(1);
    expect(f.stops()[0].authorization).toBe("Bearer synthetic-token");
    expect(f.posts()[0].url.searchParams.get("streamLifecycle")).toBe(
      "explicit-stop-v1",
    );
    expect(signal?.aborted).toBe(true);
    expect(h.current().stopState).toMatchObject({ status: "stopped" });
  },
);

it.each([false, true])(
  "retains a rejected draft in each production/dev path (dev=%s)",
  async (dev) => {
    environment(dev);
    const f = fixture(() =>
      Response.json({ error: "Running in another tab" }, { status: 409 }),
    );
    const h = await mount();
    await draft(h);
    await act(async () => {
      await h.current().handleSendMessage(event());
    });
    expect(h.current().input).toBe("Retain this draft");
    expect(h.current().attachments).toEqual([image]);
    expect(f.posts()).toHaveLength(1);
  },
);

it("retains edits away and back to identical text during admission", async () => {
  const admission = pending<Response>();
  const f = fixture(() => admission.promise);
  const h = await mount();
  await draft(h);
  let send!: Promise<void>;
  await act(async () => {
    send = h.current().handleSendMessage(event());
  });
  await waitFor(() => expect(f.posts()).toHaveLength(1));
  act(() => {
    h.current().setInput("Different");
    h.current().setInput("Retain this draft");
  });
  await act(async () => {
    admission.resolve(response());
    await send;
  });
  expect(h.current().input).toBe("Retain this draft");
});

it("retains auth-rejected preparation without a POST", async () => {
  const f = fixture(() => response());
  const h = await mount();
  await draft(h);
  external.getAccessToken.mockResolvedValue(null as unknown as string);
  await act(async () => {
    await h.current().handleSendMessage(event());
  });
  expect(f.posts()).toHaveLength(0);
  expect(h.current().input).toBe("Retain this draft");
  expect(h.current().sendError).toContain("sign in");
});

it.each([true, false])(
  "reports server Stop stopped=%s honestly, independent of SDK ready",
  async (stopped) => {
    const f = fixture(
      () => response(),
      () => Response.json({ success: true, stopped }),
    );
    const h = await mount();
    await act(async () => {
      await h.current().stop();
    });
    expect(f.stops()).toHaveLength(1);
    expect(h.current().stopState?.status).toBe(
      stopped ? "stopped" : "inactive",
    );
    if (!stopped)
      expect(h.current().stopState?.message).toContain("when Stop was checked");
  },
);

it.each([502, 503, 504, 401, "network", "malformed"])(
  "keeps %s Stop failure visible and retryable, blocking competing sends",
  async (status) => {
    let failed = true;
    const f = fixture(
      () => response(),
      () => {
        if (!failed) return Response.json({ success: true, stopped: false });
        if (status === "network") throw new TypeError("Connection lost");
        if (status === "malformed") return Response.json({ success: true });
        return Response.json(
          { error: "Stop failed" },
          { status: Number(status) },
        );
      },
    );
    const h = await mount();
    await draft(h);
    await act(async () => {
      await h.current().stop();
    });
    expect(h.current().stopState?.status).toBe("error");
    expect(h.current().stopState?.message).toBeTruthy();
    await act(async () => {
      await h.current().handleSendMessage(event());
    });
    expect(f.posts()).toHaveLength(0);
    expect(h.current().input).toBe("Retain this draft");
    failed = false;
    await act(async () => {
      await h.current().stop();
    });
    expect(h.current().stopState?.status).toBe("inactive");
    expect(f.stops()).toHaveLength(2);
  },
);

it("retains a Stop auth error without calling an unauthenticated endpoint", async () => {
  const f = fixture(() => response());
  const h = await mount();
  external.getAccessToken.mockResolvedValue(null as unknown as string);
  await act(async () => {
    await h.current().stop();
  });
  expect(f.stops()).toHaveLength(0);
  expect(h.current().stopState?.status).toBe("error");
});

it.each([false, true])(
  "cancels pending auth preparation before Stop and never sends late (dev=%s)",
  async (dev) => {
    environment(dev);
    const f = fixture(() => response());
    const h = await mount();
    await draft(h);
    const token = pending<string>();
    external.getAccessToken.mockReturnValueOnce(token.promise);
    let send!: Promise<void>;
    await act(async () => {
      send = h.current().handleSendMessage(event());
    });
    await waitFor(() => expect(h.current().isGeneratingResponse).toBe(true));
    await act(async () => {
      await h.current().stop();
      token.resolve("synthetic-token");
      await send;
    });
    expect(f.posts()).toHaveLength(0);
    expect(f.stops()).toHaveLength(1);
    expect(h.current().input).toBe("Retain this draft");
    expect(h.current().hasFailedSubmission).toBe(false);
    expect(h.current().sendError).toBeUndefined();
  },
);

it("cancels transport workspace preparation and prevents late submission", async () => {
  const f = fixture(() => response());
  const h = await mount("provisioning");
  await draft(h);
  let send!: Promise<void>;
  await act(async () => {
    send = h.current().handleSendMessage(event());
  });
  await waitFor(() => expect(h.current().status).toBe("submitted"));
  await act(async () => {
    await h.current().stop();
  });
  h.switch("chat", "ready");
  await act(async () => {
    await send;
  });
  expect(f.posts()).toHaveLength(0);
  expect(f.stops()).toHaveLength(1);
  expect(h.current().input).toBe("Retain this draft");
});

it("waits for dispatched POST admission before Stop and coalesces duplicate Stop clicks", async () => {
  const admission = pending<Response>();
  const f = fixture(() => admission.promise);
  const h = await mount();
  await draft(h);
  let send!: Promise<void>;
  await act(async () => {
    send = h.current().handleSendMessage(event());
  });
  await waitFor(() => expect(f.posts()).toHaveLength(1));
  let stop!: Promise<void>;
  let duplicate!: Promise<void>;
  await act(async () => {
    stop = h.current().stop();
    duplicate = h.current().stop();
  });
  expect(f.stops()).toHaveLength(0);
  expect(h.current().stopState?.status).toBe("stopping");
  await act(async () => {
    admission.resolve(response());
    await Promise.all([send, stop, duplicate]);
  });
  expect(f.stops()).toHaveLength(1);
  expect(f.posts()).toHaveLength(1);
  expect(h.current().stopState?.status).toBe("stopped");
});

it.each(["switch", "unmount"])(
  "fences a pending Stop token and late send completion after %s",
  async (action) => {
    const admission = pending<Response>();
    const f = fixture(() => admission.promise);
    const h = await mount();
    await draft(h);
    let send!: Promise<void>;
    await act(async () => {
      send = h.current().handleSendMessage(event());
    });
    await waitFor(() => expect(f.posts()).toHaveLength(1));
    let stop!: Promise<void>;
    await act(async () => {
      stop = h.current().stop();
    });
    if (action === "switch") {
      h.switch("next-chat");
      act(() => {
        h.current().setInput("Next chat draft");
      });
    } else h.unmount();
    await act(async () => {
      admission.resolve(response());
      await Promise.all([send, stop]);
    });
    expect(f.stops()).toHaveLength(0);
    if (action === "switch") {
      expect(h.current().input).toBe("Next chat draft");
      expect(h.current().stopState?.status).toBe("idle");
    }
  },
);

it("reconnects an accepted cut through captured authenticated GET cursor and never another POST", async () => {
  const calls: { url: URL; method: string; headers: Headers }[] = [];
  let ids = { chatId: "chat", sessionId: "session" };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input, init: RequestInit = {}) => {
      const url = new URL(String(input));
      calls.push({
        url,
        method: init.method ?? "GET",
        headers: new Headers(init.headers),
      });
      if (init.method === "POST") {
        ids = { chatId: "different-chat", sessionId: "different-session" };
        return response([
          { type: "start", messageId: "answer" },
          { type: "text-start", id: "text" },
          { type: "text-delta", id: "text", delta: "First" },
        ]);
      }
      return response([
        { type: "text-delta", id: "text", delta: " second" },
        { type: "text-end", id: "text" },
        { type: "finish" },
      ]);
    }),
  );
  const chat = new Chat({
    id: "chat",
    transport: createWorkflowChatTransport({
      baseUrl: "https://recoup.invalid",
      getIds: () => ids,
      getAccessToken: external.getAccessToken,
    }),
  });
  await chat.sendMessage({ text: "One accepted turn" });
  expect(chat.error).toBeUndefined();
  expect(calls.filter((x) => x.method === "POST")).toHaveLength(1);
  expect(calls.filter((x) => x.method === "GET")).toHaveLength(1);
  expect(calls[1].url.pathname).toBe("/api/chat/chat/stream");
  expect(calls[1].url.searchParams.get("startIndex")).toBe("3");
  calls.forEach((call) => {
    expect(call.url.searchParams.get("streamLifecycle")).toBe(
      "explicit-stop-v1",
    );
    expect(call.headers.get("Authorization")).toBe("Bearer synthetic-token");
  });
});

it("retries the original rejected payload while retaining newer composer text and attachment identities", async () => {
  const admission = pending<Response>();
  let accepted = false;
  const f = fixture(() => (accepted ? response() : admission.promise));
  const h = await mount();
  await draft(h);
  let send!: Promise<void>;
  await act(async () => {
    send = h.current().handleSendMessage(event());
  });
  await waitFor(() => expect(f.posts()).toHaveLength(1));
  const newerImage = { ...image, filename: "newer.png" };
  const newerText = { ...textFile, filename: "newer.csv" };
  act(() => {
    h.current().setInput("Newer draft");
    h.current().setAttachments([newerImage]);
    h.current().setTextAttachments([newerText]);
  });
  await act(async () => {
    admission.resolve(Response.json({ error: "Busy" }, { status: 409 }));
    await send;
  });
  expect(h.current().input).toBe("Newer draft");
  expect(h.current().failedDraftPreview).toBe("Retain this draft");
  await act(async () => {
    await h.current().handleSendMessage(event());
  });
  expect(f.posts()).toHaveLength(1);
  accepted = true;
  await act(async () => {
    await h.current().retrySendMessage?.(event());
  });
  const retried = f.posts()[1].body!.messages.at(-1)!;
  expect(JSON.stringify(retried)).toContain("Retain this draft");
  expect(JSON.stringify(retried)).toContain("draft.png");
  expect(JSON.stringify(retried)).toContain("draft.csv");
  expect(JSON.stringify(retried)).not.toContain("Newer draft");
  expect(h.current().input).toBe("Newer draft");
  expect(h.current().attachments).toEqual([newerImage]);
  expect(h.current().textAttachments).toEqual([newerText]);
  expect(h.current().hasFailedSubmission).toBe(false);
});

it("explicit discard releases a newer draft without deleting messages or attachments", async () => {
  const f = fixture(() => Response.json({ error: "Busy" }, { status: 409 }));
  const h = await mount();
  await draft(h);
  await act(async () => {
    await h.current().handleSendMessage(event());
  });
  act(() => {
    h.current().setInput("New draft");
    h.current().discardFailedSubmission?.();
  });
  expect(h.current().hasFailedSubmission).toBe(false);
  expect(h.current().input).toBe("New draft");
  expect(h.current().attachments).toEqual([image]);
  expect(f.posts()).toHaveLength(1);
  expect(f.calls.some((x) => x.method === "DELETE")).toBe(false);
});

it("keeps unknown admission plus Stopfalse retryable without replaying either draft", async () => {
  let stopped = false;
  const f = fixture(
    () => {
      throw new TypeError("Lost POST response");
    },
    () => Response.json({ success: true, stopped }),
  );
  const h = await mount();
  await draft(h);
  await act(async () => {
    await h.current().handleSendMessage(event());
  });
  act(() => h.current().setInput("Newer draft"));
  await act(async () => {
    await h.current().stop();
  });
  expect(h.current().stopState?.status).toBe("error");
  expect(h.current().stopState?.message).toContain("Retry Stop to confirm");
  await act(async () => {
    await h.current().handleSendMessage(event());
    await h.current().retrySendMessage?.(event());
  });
  expect(f.posts()).toHaveLength(1);
  expect(h.current().input).toBe("Newer draft");
  expect(h.current().failedDraftPreview).toBe("Retain this draft");
  stopped = true;
  await act(async () => {
    await h.current().stop();
  });
  expect(h.current().stopState?.status).toBe("stopped");
  expect(f.posts()).toHaveLength(1);
});

it.each(["sessionId", "workflowChatId"] as const)(
  "invalidates established %s with the same client id before late Stop/admission",
  async (field) => {
    const admission = pending<Response>();
    const f = fixture(() => admission.promise);
    const h = await mount("ready", {
      sessionId: "session",
      workflowChatId: "chat",
    });
    await draft(h);
    let send!: Promise<void>;
    let stop!: Promise<void>;
    await act(async () => {
      send = h.current().handleSendMessage(event());
    });
    await waitFor(() => expect(f.posts()).toHaveLength(1));
    await act(async () => {
      stop = h.current().stop();
    });
    h.switchIdentity({
      sessionId: "session",
      workflowChatId: "chat",
      [field]: "different",
    });
    act(() => h.current().setInput("New identity draft"));
    await act(async () => {
      admission.resolve(response());
      await Promise.all([send, stop]);
    });
    expect(f.stops()).toHaveLength(0);
    expect(h.current().input).toBe("New identity draft");
    expect(h.current().stopState?.status).toBe("idle");
  },
);

it.each([false, true])(
  "allows absent bootstrap IDs to become provisioned before admission (dev=%s)",
  async (dev) => {
    environment(dev);
    external.routeChatId = undefined;
    const f = fixture(() => response());
    const h = await mount("provisioning", {});
    await draft(h);
    let send!: Promise<void>;
    await act(async () => {
      send = h.current().handleSendMessage(event());
    });
    await waitFor(() => expect(h.current().status).toBe("submitted"));
    h.switchIdentity(
      { sessionId: "session", workflowChatId: "minted-chat" },
      "ready",
    );
    await act(async () => {
      await send;
    });
    expect(f.posts()).toHaveLength(1);
    expect(f.posts()[0].body).toMatchObject({
      sessionId: "session",
      chatId: "minted-chat",
    });
    expect(h.current().input).toBe("");
  },
);

it("keeps programmatic append rejection recoverable and excludes its optimistic ID from retry history", async () => {
  let reject = true;
  const f = fixture(() =>
    reject ? Response.json({ error: "Busy" }, { status: 409 }) : response(),
  );
  const h = await mount();
  await act(async () => {
    await h.current().append({
      id: "programmatic-user",
      role: "user",
      parts: [{ type: "text", text: "Programmatic draft" }, image],
    });
  });
  expect(h.current().hasFailedSubmission).toBe(true);
  expect(h.current().failedDraftPreview).toBe("Programmatic draft");
  expect(h.current().messages.some((x) => x.id === "programmatic-user")).toBe(
    false,
  );
  reject = false;
  await act(async () => {
    await h.current().retrySendMessage?.(event());
  });
  expect(f.posts()).toHaveLength(2);
  expect(
    f.posts()[1].body!.messages.filter((x) => x.id === "programmatic-user"),
  ).toHaveLength(1);
  expect(f.calls.some((x) => x.method === "DELETE")).toBe(false);
});

it("edits a rejected unpersisted message locally without DELETE or implicit regeneration", async () => {
  let reject = true;
  const f = fixture(() =>
    reject ? Response.json({ error: "Busy" }, { status: 409 }) : response(),
  );
  const h = await mount();
  await draft(h);
  await act(async () => {
    await h.current().handleSendMessage(event());
  });
  const rejected = f.posts()[0].body!.messages.at(-1)!;
  const setMode = vi.fn();
  const editor = render(
    <QueryClientProvider client={h.client}>
      <VercelChatContext.Provider value={h.current()}>
        <MessageEditor message={rejected} setMode={setMode} />
      </VercelChatContext.Provider>
    </QueryClientProvider>,
  );
  fireEvent.change(editor.getByTestId("message-editor"), {
    target: { value: "Edited unaccepted draft" },
  });
  fireEvent.click(editor.getByTestId("message-editor-send-button"));
  expect(f.calls.filter((x) => x.method === "DELETE")).toHaveLength(0);
  expect(f.posts()).toHaveLength(1);
  expect(h.current().input).toBe("Edited unaccepted draft");
  expect(h.current().hasFailedSubmission).toBe(false);
  reject = false;
  await act(async () => {
    await h.current().handleSendMessage(event());
  });
  expect(f.posts()).toHaveLength(2);
});

it("retains a deep-link auto-send rejection for explicit retry without automatic resubmission", async () => {
  external.routeChatId = undefined;
  const f = fixture(() => Response.json({ error: "Busy" }, { status: 409 }));
  const h = await mount("ready", { sessionId: "session" }, [
    {
      id: "initial-query",
      role: "user",
      parts: [{ type: "text", text: "Deep-link draft" }],
    },
  ]);
  await waitFor(() => expect(h.current().hasFailedSubmission).toBe(true));
  expect(h.current().input).toBe("Deep-link draft");
  expect(h.current().failedDraftPreview).toBeUndefined();
  expect(f.posts()).toHaveLength(1);
});

it("clears a deep-link draft only after admission and preserves a newer edit", async () => {
  external.routeChatId = undefined;
  const admission = pending<Response>();
  const f = fixture(() => admission.promise);
  const h = await mount("ready", { sessionId: "session" }, [
    {
      id: "initial-query",
      role: "user",
      parts: [{ type: "text", text: "Deep-link draft" }],
    },
  ]);
  await waitFor(() => expect(f.posts()).toHaveLength(1));
  expect(h.current().input).toBe("Deep-link draft");
  act(() => h.current().setInput("Newer deep-link edit"));
  await act(async () => {
    admission.resolve(response());
  });
  await waitFor(() => expect(h.current().status).toBe("ready"));
  expect(h.current().input).toBe("Newer deep-link edit");
});

it("Stop cancels a production-default resumed run through authenticated server POST, then detaches the reader", async () => {
  let reader!: ReadableStreamDefaultController<UIMessageChunk>;
  const f = fixture(
    () => response(),
    () => Response.json({ success: true, stopped: true }),
    () =>
      createUIMessageStreamResponse({
        stream: new ReadableStream({
          start(c) {
            reader = c;
            c.enqueue({ type: "start", messageId: "saved-answer" });
          },
        }),
        headers: { "x-workflow-run-id": "resumed-run" },
      }),
  );
  const h = await mount("ready", { sessionId: "session" }, undefined, false);
  await waitFor(() => expect(h.current().status).toBe("streaming"));
  await act(async () => {
    await h.current().stop();
    reader.close();
  });
  expect(f.posts()).toHaveLength(0);
  expect(f.stops()).toHaveLength(1);
  expect(h.current().stopState?.status).toBe("stopped");
  const get = f.calls.find((x) => x.url.pathname.endsWith("/stream"))!;
  expect(get.authorization).toBe("Bearer synthetic-token");
  expect(get.url.searchParams.get("streamLifecycle")).toBe("explicit-stop-v1");
});

it("does not turn an accepted stream error into a replayable unaccepted draft", async () => {
  const f = fixture(() =>
    response([
      { type: "error", errorText: "Synthetic accepted stream failure" },
    ]),
  );
  const h = await mount();
  await draft(h);
  await act(async () => {
    await h.current().handleSendMessage(event());
  });
  expect(h.current().input).toBe("");
  expect(h.current().attachments).toEqual([]);
  expect(h.current().hasFailedSubmission).toBe(false);
  expect(h.current().sendError).toBeUndefined();
  await act(async () => {
    await h.current().retrySendMessage?.(event());
  });
  expect(f.posts()).toHaveLength(1);
});

it("keeps a second tab's rejected turn recoverable while one accepted run is active", async () => {
  let active = false;
  let reader!: ReadableStreamDefaultController<UIMessageChunk>;
  const f = fixture(() => {
    if (active)
      return Response.json(
        {
          status: "error",
          error: "Another workflow is already running for this chat",
        },
        { status: 409 },
      );
    active = true;
    return createUIMessageStreamResponse({
      stream: new ReadableStream({
        start(c) {
          reader = c;
          c.enqueue({ type: "start", messageId: "active-answer" });
        },
      }),
      headers: { "x-workflow-run-id": "only-accepted-run" },
    });
  });
  const first = await mount();
  await draft(first);
  let send!: Promise<void>;
  await act(async () => {
    send = first.current().handleSendMessage(event());
  });
  await waitFor(() => expect(first.current().input).toBe(""));
  const second = await mount();
  act(() => second.current().setInput("Second tab draft"));
  await act(async () => {
    await second.current().handleSendMessage(event());
  });
  expect(f.posts()).toHaveLength(2);
  expect(second.current().input).toBe("Second tab draft");
  expect(second.current().hasFailedSubmission).toBe(true);
  expect(first.current().hasFailedSubmission).toBe(false);
  expect(f.calls.some((x) => x.method === "DELETE")).toBe(false);
  await act(async () => {
    reader.enqueue({ type: "finish" });
    reader.close();
    await send;
  });
});

it("keeps the installed negative-tail reconnect cursor with lifecycle opt-in and no POST", async () => {
  const calls: URL[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input) => {
      calls.push(new URL(String(input)));
      if (calls.length === 1) {
        const res = response([
          { type: "start", messageId: "answer" },
          { type: "text-start", id: "t" },
          { type: "text-delta", id: "t", delta: "tail" },
        ]);
        res.headers.set("x-workflow-stream-tail-index", "9");
        return res;
      }
      return response([{ type: "text-end", id: "t" }, { type: "finish" }]);
    }),
  );
  const transport = createWorkflowChatTransport({
    baseUrl: "https://recoup.invalid",
    getIds: () => ({ chatId: "chat", sessionId: "session" }),
    getAccessToken: external.getAccessToken,
  });
  const stream = await transport.reconnectToStream({
    chatId: "chat",
    startIndex: -3,
  });
  const reader = stream!.getReader();
  while (!(await reader.read()).done) {
    /* Drain the actual SDK cursor flow. */
  }
  expect(calls.map((x) => x.searchParams.get("startIndex"))).toEqual([
    "-3",
    "10",
  ]);
  expect(
    calls.every(
      (x) => x.searchParams.get("streamLifecycle") === "explicit-stop-v1",
    ),
  ).toBe(true);
});

it("blocks editing a pending optimistic message until admission without removing its user identity", async () => {
  const admission = pending<Response>();
  const f = fixture(() => admission.promise);
  const h = await mount();
  await draft(h);
  let send!: Promise<void>;
  await act(async () => {
    send = h.current().handleSendMessage(event());
  });
  await waitFor(() => expect(f.posts()).toHaveLength(1));
  const message = f.posts()[0].body!.messages.at(-1)!;
  const editor = render(
    <QueryClientProvider client={h.client}>
      <VercelChatContext.Provider value={h.current()}>
        <MessageEditor message={message} setMode={vi.fn()} />
      </VercelChatContext.Provider>
    </QueryClientProvider>,
  );
  expect(
    editor.getByTestId("message-editor-send-button").hasAttribute("disabled"),
  ).toBe(true);
  fireEvent.click(editor.getByTestId("message-editor-send-button"));
  expect(f.calls.some((x) => x.method === "DELETE")).toBe(false);
  await act(async () => {
    admission.resolve(
      response([
        { type: "start", messageId: "answer" },
        { type: "text-start", id: "t" },
        { type: "text-delta", id: "t", delta: "Accepted answer" },
        { type: "text-end", id: "t" },
        { type: "finish" },
      ]),
    );
    await send;
  });
  expect(
    h.current().messages.some((x) => x.id === message.id && x.role === "user"),
  ).toBe(true);
  expect(h.current().messages.some((x) => x.role === "assistant")).toBe(true);
});

it("keeps the exact pendingStop prerequisite503 visible for manual Stop retry", async () => {
  let pendingSlot = true;
  const f = fixture(
    () => response(),
    () =>
      pendingSlot
        ? Response.json(
            {
              status: "error",
              error: "Workflow is still starting; retry Stop shortly",
            },
            { status: 503 },
          )
        : Response.json({ success: true, stopped: true }),
  );
  const h = await mount();
  await draft(h);
  await act(async () => {
    await h.current().stop();
  });
  expect(h.current().stopState?.status).toBe("error");
  expect(h.current().input).toBe("Retain this draft");
  expect(f.posts()).toHaveLength(0);
  pendingSlot = false;
  await act(async () => {
    await h.current().stop();
  });
  expect(h.current().stopState?.status).toBe("stopped");
  expect(f.posts()).toHaveLength(0);
});

it("blocks a same-turn Send from an old callback after Stop rejects before React rerenders", async () => {
  const f = fixture(
    () => response(),
    () =>
      Response.json({ status: "error", error: "Stop failed" }, { status: 502 }),
  );
  const h = await mount();
  await draft(h);
  const oldSend = h.current().handleSendMessage;
  await act(async () => {
    await h.current().stop();
    await oldSend(event());
  });
  expect(f.posts()).toHaveLength(0);
  expect(h.current().input).toBe("Retain this draft");
});

it.each(["stop", "send", "append", "reload"] as const)(
  "ignores retained %s actions invoked after a committed chat switch before any external preparation",
  async (action) => {
    const f = fixture(() => response());
    const h = await mount();
    await draft(h);
    const old = h.current();
    h.switch("next-chat");
    await waitFor(() => expect(h.current().status).toBe("ready"));
    act(() => h.current().setInput("Next chat private draft"));
    const calls = f.calls.length;
    const tokenCalls = external.getAccessToken.mock.calls.length;
    await act(async () => {
      if (action === "stop") await old.stop();
      else if (action === "send") await old.handleSendMessage(event());
      else if (action === "reload") await old.reload();
      else
        old.append({
          id: "old-append",
          role: "user",
          parts: [{ type: "text", text: "Old appended draft" }],
        });
    });
    expect(f.calls).toHaveLength(calls);
    expect(external.getAccessToken).toHaveBeenCalledTimes(tokenCalls);
    expect(h.current().input).toBe("Next chat private draft");
    expect(h.current().stopState?.status).toBe("idle");
  },
);

it.each(["stop", "send"] as const)(
  "does not revive a retained %s action after switching away and back",
  async (action) => {
    const f = fixture(() => response());
    const h = await mount();
    await draft(h);
    const old = h.current();
    h.switch("other-chat");
    await waitFor(() => expect(h.current().status).toBe("ready"));
    h.switch("chat");
    await waitFor(() => expect(h.current().status).toBe("ready"));
    act(() => h.current().setInput("New generation draft"));
    const calls = f.calls.length;
    await act(async () => {
      if (action === "stop") await old.stop();
      else await old.handleSendMessage(event());
    });
    expect(f.calls).toHaveLength(calls);
    expect(h.current().input).toBe("New generation draft");
    expect(h.current().stopState?.status).toBe("idle");
  },
);

it.each(["sessionId", "workflowChatId"] as const)(
  "rejects retained actions after established %s replacement with the same client id",
  async (field) => {
    const f = fixture(() => response());
    const h = await mount("ready", {
      sessionId: "session",
      workflowChatId: "chat",
    });
    await draft(h);
    const old = h.current();
    const previousResumes = f.calls.filter((x) =>
      x.url.pathname.endsWith("/stream"),
    ).length;
    h.switchIdentity({
      sessionId: "session",
      workflowChatId: "chat",
      [field]: "replacement",
    });
    await waitFor(() =>
      expect(
        f.calls.filter((x) => x.url.pathname.endsWith("/stream")),
      ).toHaveLength(previousResumes + 1),
    );
    await waitFor(() => expect(h.current().status).toBe("ready"));
    act(() => h.current().setInput("Replacement draft"));
    const calls = f.calls.length;
    await act(async () => {
      await old.stop();
      await old.handleSendMessage(event());
    });
    expect(f.calls).toHaveLength(calls);
    expect(h.current().input).toBe("Replacement draft");
  },
);

it("keeps retained retry, discard, edit, input and message setters from mutating a new scope", async () => {
  const f = fixture(() => Response.json({ error: "Busy" }, { status: 409 }));
  const h = await mount();
  await draft(h);
  const old = h.current();
  h.switch("next-chat");
  await waitFor(() =>
    expect(
      f.calls.some((x) => x.url.pathname === "/api/chat/next-chat/stream"),
    ).toBe(true),
  );
  await waitFor(() => expect(h.current().status).toBe("ready"));
  act(() => h.current().setInput("New scope rejected draft"));
  await act(async () => {
    await h.current().handleSendMessage(event());
  });
  const rejected = f.posts().at(-1)!.body!.messages.at(-1)!;
  const calls = f.calls.length;
  const messages = h.current().messages;
  await act(async () => {
    old.retryHistory?.();
    await old.retrySendMessage?.(event());
    old.discardFailedSubmission?.();
    old.editUnacceptedMessage?.(rejected.id, "Old editor content");
    old.setInput("Old input setter");
    old.setMessages([
      {
        id: "old-setter",
        role: "user",
        parts: [{ type: "text", text: "Old history" }],
      },
    ]);
  });
  expect(f.calls).toHaveLength(calls);
  expect(h.current().hasFailedSubmission).toBe(true);
  expect(h.current().input).toBe("New scope rejected draft");
  expect(h.current().messages).toEqual(messages);
});

it("allows retained bootstrap actions to bind IDs filled by their own provisioning", async () => {
  external.routeChatId = undefined;
  const f = fixture(() => response());
  const h = await mount("provisioning", {});
  await draft(h);
  const old = h.current();
  h.switchIdentity(
    { sessionId: "session", workflowChatId: "minted-chat" },
    "ready",
  );
  await act(async () => {
    await old.handleSendMessage(event());
    await old.stop();
  });
  expect(f.posts()).toHaveLength(1);
  expect(f.posts()[0].body).toMatchObject({
    chatId: "minted-chat",
    sessionId: "session",
  });
  expect(f.stops()).toHaveLength(1);
  expect(f.stops()[0].url.pathname).toBe("/api/chat/minted-chat/stop");
});

it.each([
  [409, "Another response is running. Retry when it finishes."],
  [429, "Please wait a moment, then retry."],
  [503, "Chat is unavailable. Please retry shortly."],
  [401, "Please sign in again to send this message."],
] as const)(
  "uses actionable send copy for %i and keeps its status out of product text",
  async (status, message) => {
    fixture(() =>
      Response.json({ status: "error", error: "Synthetic denial" }, { status }),
    );
    const h = await mount();
    await draft(h);
    await act(async () => {
      await h.current().handleSendMessage(event());
    });
    expect(h.current().sendError).toBe(message);
    expect(h.current().sendError).not.toContain(String(status));
    expect(h.current().sendErrorStatus).toBe(status);
    expect(h.current().failedDraftPreview).toBeUndefined();
  },
);

it.each([502, 504, 401] as const)(
  "uses actionable Stop copy for %i without exposing the HTTP code",
  async (status) => {
    fixture(
      () => response(),
      () =>
        Response.json(
          { status: "error", error: "Synthetic failure" },
          { status },
        ),
    );
    const h = await mount();
    await act(async () => {
      await h.current().stop();
    });
    expect(h.current().stopState?.message).toBe(
      status === 401
        ? "Please sign in again to stop this response."
        : "Couldn’t confirm Stop. Please retry.",
    );
    expect(h.current().stopState?.message).not.toContain(String(status));
    expect(h.current().stopState?.httpStatus).toBe(status);
  },
);

it.each([false, true])(
  "keeps current guarded setters and history loading stable across draft renders (dev=%s)",
  async (dev) => {
    environment(dev);
    const f = fixture(() => response());
    const h = await mount();
    const setInput = h.current().setInput;
    const setMessages = h.current().setMessages;
    act(() => h.current().setInput("First edit"));
    act(() => h.current().setInput("Second edit"));
    expect(h.current().setInput).toBe(setInput);
    expect(h.current().setMessages).toBe(setMessages);
    expect(
      f.calls.filter(
        (call) =>
          call.method === "GET" &&
          call.url.pathname.startsWith("/api/sessions/"),
      ),
    ).toHaveLength(1);
    expect(h.current().messages).toEqual(history);
  },
);

it("preserves a newer same-chat draft when a retained Send submits its older render's input", async () => {
  const f = fixture(() => response());
  const h = await mount();
  await draft(h);
  const oldSend = h.current().handleSendMessage;
  const newerImage = { ...image, filename: "newer.png" };
  const newerText = { ...textFile, filename: "newer.csv" };
  act(() => {
    h.current().setInput("Newer same-chat draft");
    h.current().setAttachments([newerImage]);
    h.current().setTextAttachments([newerText]);
  });
  await act(async () => {
    await oldSend(event());
  });
  expect(JSON.stringify(f.posts()[0].body!.messages.at(-1))).toContain(
    "Retain this draft",
  );
  expect(h.current().input).toBe("Newer same-chat draft");
  expect(h.current().attachments).toEqual([newerImage]);
  expect(h.current().textAttachments).toEqual([newerText]);
});

it.each(["denied", "unknown then stopped"] as const)(
  "quality recovery restores the Send affordance after discarding %s",
  async (outcome) => {
    fixture(() => {
      if (outcome === "unknown then stopped")
        throw new TypeError("Failed to fetch");
      return Response.json({ error: "Busy" }, { status: 409 });
    });
    const h = await mount(
      "ready",
      { sessionId: "session" },
      undefined,
      true,
      true,
    );
    act(() => h.current().setInput("Original"));
    await act(async () => {
      await h.current().handleSendMessage(event());
    });
    act(() => h.current().setInput("Newer ready draft"));
    if (outcome === "unknown then stopped")
      await act(async () => {
        await h.current().stop();
      });
    fireEvent.click(h.getByRole("button", { name: "Discard failed message" }));
    const button = h.getByRole("button", {
      name: "Send message",
    }) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
    expect(button.querySelector(".lucide-send")).not.toBeNull();
    expect(button.querySelector(".lucide-x")).toBeNull();
    expect(h.current().input).toBe("Newer ready draft");
  },
);

it("quality recovery keeps original uncertainty visible beside confirmed Stop", async () => {
  fixture(() => {
    throw new TypeError("Failed to fetch");
  });
  const h = await mount(
    "ready",
    { sessionId: "session" },
    undefined,
    true,
    true,
  );
  act(() => h.current().setInput("Original"));
  await act(async () => {
    await h.current().handleSendMessage(event());
  });
  act(() => h.current().setInput("Newer draft"));
  await act(async () => {
    await h.current().stop();
  });
  const alert = h.getByRole("alert");
  expect(alert.textContent).toContain("Response stopped.");
  expect(alert.textContent).toContain(
    "Couldn’t confirm this message was sent. Please retry.",
  );
  expect(alert.textContent).toContain("Original");
  expect(h.current().hasFailedSubmission).toBe(true);
  expect(h.getByRole("button", { name: "Retry" })).toBeTruthy();
  expect(h.current().input).toBe("Newer draft");
});

it.each([
  [false, "switch", 200],
  [false, "unmount", 200],
  [false, "switch", 409],
  [false, "unmount", 409],
  [true, "switch", 200],
  [true, "unmount", 200],
  [true, "switch", 409],
  [true, "unmount", 409],
] as const)(
  "operation-owned completion ignores old work (dev=%s, action=%s, status=%i)",
  async (dev, action, status) => {
    environment(dev);
    const admission = pending<Response>();
    const f = fixture(() => admission.promise);
    const h = await mount();
    act(() => h.current().setInput("Old pending"));
    let send!: Promise<void>;
    await act(async () => {
      send = h.current().handleSendMessage(event());
    });
    await waitFor(() => expect(f.posts()).toHaveLength(1));
    external.refetchCredits.mockClear();
    external.toastError.mockClear();
    if (action === "switch") {
      // This check has no current resumed run; a separate control below
      // explicitly finishes the new view's GET and expects its one refresh.
      external.routeChatId = undefined;
      h.switch("new-chat");
    } else h.unmount();
    await act(async () => {
      admission.resolve(
        status === 200
          ? response()
          : Response.json({ error: "Old denial" }, { status }),
      );
      await send;
    });
    expect(external.refetchCredits).not.toHaveBeenCalled();
    expect(external.toastError).not.toHaveBeenCalled();
  },
);

it.each([false, true])(
  "operation-owned completion refreshes the current canonical finish exactly once (dev=%s)",
  async (dev) => {
    environment(dev);
    fixture(() =>
      response([
        { type: "start", messageId: "canonical-answer" },
        { type: "text-start", id: "answer" },
        { type: "text-delta", id: "answer", delta: "Done" },
        { type: "text-end", id: "answer" },
        { type: "finish", finishReason: "stop" },
      ]),
    );
    const h = await mount();
    external.refetchCredits.mockClear();
    act(() => h.current().setInput("Current"));
    await act(async () => {
      await h.current().handleSendMessage(event());
    });
    expect(external.refetchCredits).toHaveBeenCalledTimes(1);
    expect(h.current().status).toBe("ready");
    expect(external.toastError).not.toHaveBeenCalled();
  },
);

it.each([false, true])(
  "operation-owned completion separates an old POST from the new scope's resumed GET (dev=%s)",
  async (dev) => {
    environment(dev);
    external.routeChatId = undefined;
    const admission = pending<Response>();
    let reader!: ReadableStreamDefaultController<UIMessageChunk>;
    const f = fixture(
      () => admission.promise,
      undefined,
      () =>
        createUIMessageStreamResponse({
          stream: new ReadableStream({
            start(c) {
              reader = c;
              c.enqueue({ type: "start", messageId: "saved-answer" });
            },
          }),
          headers: { "x-workflow-run-id": "new-scope-run" },
        }),
    );
    const h = await mount("ready", { sessionId: "session" }, history);
    act(() => h.current().setInput("Old pending"));
    let send!: Promise<void>;
    await act(async () => {
      send = h.current().handleSendMessage(event());
    });
    await waitFor(() => expect(f.posts()).toHaveLength(1));
    external.refetchCredits.mockClear();
    external.routeChatId = "new-chat";
    h.switch("new-chat");
    await waitFor(() => expect(h.current().status).toBe("streaming"));
    await act(async () => {
      admission.resolve(response());
      await send;
    });
    expect(external.refetchCredits).not.toHaveBeenCalled();
    await act(async () => {
      reader.enqueue({ type: "finish" });
      reader.close();
    });
    await waitFor(() => expect(h.current().status).toBe("ready"));
    expect(external.refetchCredits.mock.calls).toEqual([["new-chat"]]);
    expect(f.posts()).toHaveLength(1);
    expect(
      f.calls.filter((call) => call.url.pathname.endsWith("/stream")),
    ).toHaveLength(1);
  },
);

it.each([false, true])(
  "operation-owned completion refreshes accepted Stop exactly once (dev=%s)",
  async (dev) => {
    environment(dev);
    let reader!: ReadableStreamDefaultController<UIMessageChunk>;
    const f = fixture(() =>
      createUIMessageStreamResponse({
        stream: new ReadableStream({
          start(c) {
            reader = c;
            c.enqueue({ type: "start", messageId: "accepted-answer" });
          },
        }),
        headers: { "x-workflow-run-id": "accepted-run" },
      }),
    );
    const h = await mount();
    external.refetchCredits.mockClear();
    act(() => h.current().setInput("Current"));
    let send!: Promise<void>;
    await act(async () => {
      send = h.current().handleSendMessage(event());
    });
    await waitFor(() => expect(h.current().status).toBe("streaming"));
    await act(async () => {
      await h.current().stop();
      reader.close();
      await send;
    });
    expect(external.refetchCredits).toHaveBeenCalledTimes(1);
    expect(f.posts()).toHaveLength(1);
    expect(f.stops()).toHaveLength(1);
    expect(h.current().stopState?.status).toBe("stopped");
  },
);

it.each([false, true])(
  "operation-owned completion refreshes a valid resumed finish exactly once (dev=%s)",
  async (dev) => {
    environment(dev);
    let reader!: ReadableStreamDefaultController<UIMessageChunk>;
    const f = fixture(
      () => response(),
      undefined,
      () =>
        createUIMessageStreamResponse({
          stream: new ReadableStream({
            start(c) {
              reader = c;
              c.enqueue({ type: "start", messageId: "saved-answer" });
            },
          }),
          headers: { "x-workflow-run-id": "resumed-run" },
        }),
    );
    const h = await mount("ready", { sessionId: "session" }, undefined, false);
    await waitFor(() => expect(h.current().status).toBe("streaming"));
    external.refetchCredits.mockClear();
    await act(async () => {
      reader.enqueue({ type: "finish" });
      reader.close();
    });
    await waitFor(() => expect(h.current().status).toBe("ready"));
    expect(external.refetchCredits).toHaveBeenCalledTimes(1);
    expect(f.posts()).toHaveLength(0);
  },
);

it.each(["throws", "rejects"] as const)(
  "operation-owned completion stays ready when credit refresh %s",
  async (failure) => {
    fixture(() => response());
    const h = await mount();
    external.refetchCredits.mockClear();
    external.refetchCredits.mockImplementationOnce(() => {
      if (failure === "throws")
        throw new Error("Synthetic credit refresh error");
      return Promise.reject(new Error("Synthetic credit refresh error"));
    });
    act(() => h.current().setInput("Accepted despite refresh error"));
    await act(async () => {
      await h.current().handleSendMessage(event());
    });
    expect(external.refetchCredits).toHaveBeenCalledTimes(1);
    expect(h.current().status).toBe("ready");
    expect(h.current().hasFailedSubmission).toBe(false);
    expect(external.toastError).not.toHaveBeenCalled();
  },
);

it.each(["throws", "rejects"] as const)(
  "operation-owned completion releases the transport before credit refresh %s",
  async (failure) => {
    fixture(() => response());
    const lifecycle = createChatRequestLifecycle();
    const begin = lifecycle.begin;
    let active = 0;
    let activeDuringRefresh: number | undefined;
    lifecycle.begin = () => {
      active++;
      const operation = begin();
      const dispose = operation.dispose;
      let disposed = false;
      operation.dispose = () => {
        if (!disposed) {
          disposed = true;
          active--;
        }
        dispose();
      };
      return operation;
    };
    const refresh = vi.fn(() => {
      activeDuringRefresh = active;
      if (failure === "throws") throw new Error("Synthetic refresh error");
      return Promise.reject(new Error("Synthetic refresh error"));
    });
    const chat = new Chat({
      id: "chat",
      transport: createWorkflowChatTransport({
        baseUrl: "https://recoup.invalid",
        getIds: () => ({ chatId: "chat", sessionId: "session" }),
        getAccessToken: async () => "synthetic-token",
        requestLifecycle: lifecycle,
        captureStreamEnd: () => refresh,
      }),
    });
    await chat.sendMessage({ text: "Accepted" });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(activeDuringRefresh).toBe(0);
    expect(active).toBe(0);
    expect(chat.status).toBe("ready");
  },
);

it.each(["denied", "unknown"] as const)(
  "operation-owned completion does not refresh an unaccepted %s send",
  async (outcome) => {
    external.routeChatId = undefined;
    fixture(() => {
      if (outcome === "unknown") throw new TypeError("Failed to fetch");
      return Response.json({ error: "Busy" }, { status: 409 });
    });
    const h = await mount("ready", { sessionId: "session" }, history);
    act(() => h.current().setInput("Unaccepted"));
    await act(async () => {
      await h.current().handleSendMessage(event());
    });
    expect(h.current().hasFailedSubmission).toBe(true);
    expect(external.refetchCredits).not.toHaveBeenCalled();
  },
);

it.each([false, true])(
  "operation-owned completion refreshes confirmed Stop of a resumed run exactly once (dev=%s)",
  async (dev) => {
    environment(dev);
    let reader!: ReadableStreamDefaultController<UIMessageChunk>;
    let stopCount = 0;
    const confirmation = pending<Response>();
    const f = fixture(
      () => response(),
      () =>
        ++stopCount < 3
          ? Response.json(
              {
                status: "error",
                error: "Workflow is still starting; retry Stop shortly",
              },
              { status: stopCount === 1 ? 503 : 502 },
            )
          : confirmation.promise,
      () =>
        createUIMessageStreamResponse({
          stream: new ReadableStream({
            start(c) {
              reader = c;
              c.enqueue({ type: "start", messageId: "saved-answer" });
            },
          }),
          headers: { "x-workflow-run-id": "resumed-run" },
        }),
    );
    const h = await mount("ready", { sessionId: "session" }, undefined, false);
    await waitFor(() => expect(h.current().status).toBe("streaming"));
    const get = f.calls.find((call) => call.url.pathname.endsWith("/stream"))!;
    external.refetchCredits.mockClear();
    for (const status of [503, 502]) {
      await act(async () => {
        await h.current().stop();
      });
      expect(h.current().stopState?.httpStatus).toBe(status);
      expect(h.current().status).toBe("streaming");
      expect(get.signal?.aborted).toBe(false);
    }
    let stopping!: Promise<void>;
    await act(async () => {
      stopping = h.current().stop();
    });
    await waitFor(() => expect(f.stops()).toHaveLength(3));
    expect(get.signal?.aborted).toBe(false);
    expect(external.refetchCredits).not.toHaveBeenCalled();
    await act(async () => {
      confirmation.resolve(Response.json({ success: true, stopped: true }));
      await stopping;
      reader.close();
    });
    expect(get.signal?.aborted).toBe(true);
    expect(external.refetchCredits).toHaveBeenCalledTimes(1);
    expect(f.posts()).toHaveLength(0);
    expect(f.stops()).toHaveLength(3);
    expect(f.stops().every((call) => !call.signal)).toBe(true);
    expect(h.current().stopState?.status).toBe("stopped");
  },
);

it("operation-owned completion ignores a superseded reader and captures the new callback once", async () => {
  let reader!: ReadableStreamDefaultController<UIMessageChunk>;
  let postCount = 0;
  const f = fixture(() =>
    ++postCount === 1
      ? createUIMessageStreamResponse({
          stream: new ReadableStream({
            start(c) {
              reader = c;
              c.enqueue({ type: "start", messageId: "old-answer" });
            },
          }),
          headers: { "x-workflow-run-id": "old-run" },
        })
      : response(),
  );
  const oldRefresh = vi.fn();
  const newRefresh = vi.fn();
  let currentRefresh = oldRefresh;
  const transport = createWorkflowChatTransport({
    baseUrl: "https://recoup.invalid",
    getIds: () => ({ chatId: "chat", sessionId: "session" }),
    getAccessToken: async () => "synthetic-token",
    captureStreamEnd: () => currentRefresh,
  });
  const oldChat = new Chat({ id: "old-chat", transport });
  const oldSend = oldChat.sendMessage({ text: "Old" });
  await waitFor(() => expect(oldChat.status).toBe("streaming"));
  currentRefresh = newRefresh;
  const newChat = new Chat({ id: "new-chat", transport });
  await newChat.sendMessage({ text: "New" });
  reader.enqueue({ type: "finish" });
  reader.close();
  await oldSend;
  expect(oldRefresh).not.toHaveBeenCalled();
  expect(newRefresh).toHaveBeenCalledTimes(1);
  expect(f.posts()).toHaveLength(2);
});

it("operation-owned completion releases Send while credit refresh is unresolved", async () => {
  const f = fixture(() => response());
  const h = await mount();
  const refresh = pending<void>();
  external.refetchCredits.mockClear();
  external.refetchCredits.mockImplementationOnce(() => refresh.promise);
  act(() => h.current().setInput("First accepted message"));
  await act(async () => {
    await h.current().handleSendMessage(event());
  });
  expect(h.current().status).toBe("ready");
  expect(h.current().isGeneratingResponse).toBe(false);
  expect(h.current().hasFailedSubmission).toBe(false);
  act(() => h.current().setInput("Next accepted message"));
  await act(async () => {
    await h.current().handleSendMessage(event());
  });
  expect(h.current().status).toBe("ready");
  expect(f.posts()).toHaveLength(2);
  expect(external.refetchCredits).toHaveBeenCalledTimes(2);
  await act(async () => {
    refresh.resolve();
  });
  expect(external.refetchCredits).toHaveBeenCalledTimes(2);
});

async function bootstrapHarness(
  stop: () => Response = () =>
    Response.json({ error: "Chat not found" }, { status: 404 }),
  initialMessages?: UIMessage[],
  post: () => Response = () => response(),
) {
  const session = pending<Response>();
  const sandbox = pending<Response>();
  const f = fixture(post, stop, undefined, {
    session: () => session.promise,
    sandbox: () => sandbox.promise,
  });
  const h = await mountBootstrap(initialMessages);
  await waitFor(() =>
    expect(
      f.calls.filter((call) => call.url.pathname === "/api/sessions"),
    ).toHaveLength(1),
  );
  return {
    f,
    h,
    mint: async () => {
      await act(async () => {
        session.resolve(
          Response.json({
            session: {
              id: "minted-session",
              cloneUrl: "https://recoup.invalid/synthetic-repo",
            },
            chat: { id: "minted-chat" },
          }),
        );
      });
      await waitFor(() => expect(h.current().sessionId).toBe("minted-session"));
    },
    ready: async () => {
      await act(async () => {
        sandbox.resolve(
          Response.json({ mode: "synthetic", createdAt: 0, timeout: null }),
        );
      });
      await waitFor(() => expect(h.current().workspaceStatus).toBe("ready"));
    },
  };
}

it.each([
  [false, false, false],
  [false, true, false],
  [true, false, false],
  [true, true, false],
  [false, false, true],
  [true, false, true],
] as const)(
  "review bootstrap cancels undispatched Send locally before IDs and permits explicit Send after ready (dev=%s, newer=%s, deepLink=%s)",
  async (dev, newer, deepLink) => {
    environment(dev);
    const { f, h, mint, ready } = await bootstrapHarness(
      undefined,
      deepLink
        ? [
            {
              id: "q",
              role: "user",
              parts: [{ type: "text", text: "Original bootstrap draft" }],
            },
          ]
        : undefined,
    );
    act(() => {
      h.current().setInput("Original bootstrap draft");
      h.current().setAttachments([image]);
      h.current().setTextAttachments([textFile]);
    });
    fireEvent.click(h.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(h.current().status).toBe("submitted"));
    const optimisticId = h.current().messages.at(-1)!.id;
    const extraImage = { ...image, filename: "newer.png" };
    const extraText = { ...textFile, filename: "newer.csv" };
    if (newer)
      act(() => {
        h.current().setInput("Newer bootstrap draft");
        h.current().setAttachments([image, extraImage]);
        h.current().setTextAttachments([textFile, extraText]);
      });
    fireEvent.click(h.getByRole("button", { name: "Stop response" }));
    await waitFor(() => expect(h.current().isGeneratingResponse).toBe(false));
    expect(f.stops()).toHaveLength(0);
    expect(h.current().stopState?.message).toBe(
      "Message preparation cancelled. Your draft is still here.",
    );
    expect(h.current().hasFailedSubmission).toBe(false);
    await mint();
    expect(h.current().workspaceStatus).toBe("provisioning");
    await ready();
    expect(f.posts()).toHaveLength(0);
    expect(f.stops()).toHaveLength(0);
    expect(external.addOptimisticConversation).not.toHaveBeenCalled();
    expect(h.current().input).toBe(
      newer ? "Newer bootstrap draft" : "Original bootstrap draft",
    );
    expect(h.current().attachments).toEqual(
      newer ? [image, extraImage] : [image],
    );
    expect(h.current().textAttachments).toEqual(
      newer ? [textFile, extraText] : [textFile],
    );
    expect(h.current().sendError).toBeUndefined();
    fireEvent.click(h.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(f.posts()).toHaveLength(1));
    await waitFor(() => expect(h.current().status).toBe("ready"));
    expect(f.posts()[0].body).toMatchObject({
      sessionId: "minted-session",
      chatId: "minted-chat",
    });
    expect(
      f
        .posts()[0]
        .body!.messages.some((message) => message.id === optimisticId),
    ).toBe(false);
    expect(h.current().input).toBe("");
    expect(h.current().attachments).toEqual([]);
    expect(h.current().textAttachments).toEqual([]);
    expect(external.addOptimisticConversation).toHaveBeenCalledTimes(1);
    expect(f.calls.some((call) => call.method === "DELETE")).toBe(false);
  },
);

it.each([false, true])(
  "review bootstrap Stop uses the real minted ID during sandbox preparation (dev=%s)",
  async (dev) => {
    environment(dev);
    const { f, h, mint, ready } = await bootstrapHarness(() =>
      Response.json({ success: true, stopped: false }),
    );
    await mint();
    act(() => h.current().setInput("Minted pending workspace"));
    fireEvent.click(h.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(h.current().status).toBe("submitted"));
    fireEvent.click(h.getByRole("button", { name: "Stop response" }));
    await waitFor(() => expect(h.current().stopState?.status).toBe("inactive"));
    expect(f.stops()).toHaveLength(1);
    expect(f.stops()[0].url.pathname).toBe("/api/chat/minted-chat/stop");
    expect(f.stops()[0].authorization).toBe("Bearer synthetic-token");
    await ready();
    expect(f.posts()).toHaveLength(0);
    expect(h.current().input).toBe("Minted pending workspace");
    expect(h.current().hasFailedSubmission).toBe(false);
  },
);

it.each([false, true])(
  "review canonical Stop keeps its real client ID without bootstrap provenance (dev=%s)",
  async (dev) => {
    environment(dev);
    external.routeChatId = undefined;
    const f = fixture(() => response());
    const h = await mount("provisioning", {});
    await draft(h);
    let send!: Promise<void>;
    await act(async () => {
      send = h.current().handleSendMessage(event());
    });
    await waitFor(() => expect(h.current().status).toBe("submitted"));
    await act(async () => {
      await h.current().stop();
      await send;
    });
    expect(f.stops()).toHaveLength(1);
    expect(f.stops()[0].url.pathname).toBe("/api/chat/chat/stop");
    expect(f.posts()).toHaveLength(0);
    expect(h.current().input).toBe("Retain this draft");
    expect(h.current().hasFailedSubmission).toBe(false);
  },
);

it.each([
  [false, "retry"],
  [true, "retry"],
  [false, "discard then Send"],
  [true, "discard then Send"],
] as const)(
  "review later confirmed admission supersedes earlier unknown response after %s recovery (%s)",
  async (dev, recovery) => {
    environment(dev);
    let posts = 0;
    const f = fixture(
      () => {
        if (++posts === 1) throw new TypeError("Lost POST response");
        return response();
      },
      () => Response.json({ success: true, stopped: false }),
    );
    const h = await mount();
    await draft(h);
    await act(async () => {
      await h.current().handleSendMessage(event());
    });
    act(() => h.current().setInput("Newer draft"));
    await act(async () => {
      if (recovery === "retry") await h.current().retrySendMessage?.(event());
      else {
        h.current().discardFailedSubmission?.();
        await h.current().handleSendMessage(event());
      }
    });
    expect(f.posts()).toHaveLength(2);
    expect(h.current().hasFailedSubmission).toBe(false);
    await act(async () => {
      await h.current().stop();
    });
    expect(h.current().stopState?.status).toBe("inactive");
    expect(h.current().stopState?.message).toContain(
      "No active response was found",
    );
    expect(f.posts()).toHaveLength(2);
    act(() => h.current().setInput("Explicit follow-up"));
    await act(async () => {
      await h.current().handleSendMessage(event());
    });
    expect(f.posts()).toHaveLength(3);
    expect(f.calls.some((call) => call.method === "DELETE")).toBe(false);
  },
);

it.each([false, true])(
  "review Discard alone cannot resolve unknown admission or Stopfalse (dev=%s)",
  async (dev) => {
    environment(dev);
    const f = fixture(
      () => {
        throw new TypeError("Lost POST response");
      },
      () => Response.json({ success: true, stopped: false }),
    );
    const h = await mount();
    await draft(h);
    await act(async () => {
      await h.current().handleSendMessage(event());
    });
    act(() => {
      h.current().setInput("Newer draft");
      h.current().discardFailedSubmission?.();
    });
    await act(async () => {
      await h.current().stop();
      await h.current().handleSendMessage(event());
    });
    expect(h.current().stopState?.status).toBe("error");
    expect(h.current().stopState?.message).toContain("Retry Stop to confirm");
    expect(h.current().input).toBe("Newer draft");
    expect(f.posts()).toHaveLength(1);
  },
);

it.each([
  [false, "denied"],
  [true, "denied"],
  [false, "missing header"],
  [true, "missing header"],
  [false, "missing body"],
  [true, "missing body"],
] as const)(
  "review pinned Workflow SDK does not admit a rejected response (dev=%s, response=%s)",
  async (dev, kind) => {
    environment(dev);
    external.routeChatId = undefined;
    const f = fixture(() => {
      if (kind === "missing body")
        return new Response(null, {
          headers: { "x-workflow-run-id": "forged-run" },
        });
      const result = response();
      if (kind === "missing header") result.headers.delete("x-workflow-run-id");
      return kind === "denied"
        ? new Response(result.body, { status: 409, headers: result.headers })
        : result;
    });
    const h = await mount("ready", { sessionId: "session" }, []);
    await draft(h);
    await act(async () => {
      await h.current().handleSendMessage(event());
    });
    expect(h.current().hasFailedSubmission).toBe(true);
    expect(h.current().input).toBe("Retain this draft");
    expect(h.current().attachments).toEqual([image]);
    expect(h.current().textAttachments).toEqual([textFile]);
    expect(h.current().messages).toEqual([]);
    expect(external.addOptimisticConversation).not.toHaveBeenCalled();
    expect(external.refetchCredits).not.toHaveBeenCalled();
    expect(f.posts()).toHaveLength(1);
  },
);

it.each([false, true])(
  "review bootstrap local cancellation releases a pre-SDK auth wait without a late POST (dev=%s)",
  async (dev) => {
    environment(dev);
    const { f, h, mint, ready } = await bootstrapHarness();
    act(() => {
      h.current().setInput("Held auth draft");
      h.current().setAttachments([image]);
      h.current().setTextAttachments([textFile]);
    });
    const token = pending<string>();
    external.getAccessToken.mockReturnValueOnce(token.promise);
    fireEvent.click(h.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(h.current().isGeneratingResponse).toBe(true));
    fireEvent.click(h.getByRole("button", { name: "Stop response" }));
    await waitFor(() => expect(h.current().stopState?.status).toBe("inactive"));
    await mint();
    await ready();
    expect(f.posts()).toHaveLength(0);
    expect(f.stops()).toHaveLength(0);
    expect(h.current().attachments).toEqual([image]);
    expect(h.current().textAttachments).toEqual([textFile]);
    act(() => h.current().setInput("Explicit new draft"));
    fireEvent.click(h.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(f.posts()).toHaveLength(1));
    await waitFor(() => expect(h.current().status).toBe("ready"));
    act(() => h.current().setInput("After accepted edit"));
    await act(async () => {
      token.resolve("synthetic-token");
      await token.promise;
    });
    expect(h.current().input).toBe("After accepted edit");
    expect(h.current().hasFailedSubmission).toBe(false);
    expect(f.posts()).toHaveLength(1);
    expect(f.stops()).toHaveLength(0);
  },
);

it.each([
  [false, false],
  [true, false],
  [false, true],
  [true, true],
] as const)(
  "review retained bootstrap Stop resolves committed IDs at invocation (dev=%s, accepted=%s)",
  async (dev, accepted) => {
    environment(dev);
    let reader!: ReadableStreamDefaultController<UIMessageChunk>;
    const { f, h, mint, ready } = await bootstrapHarness(
      () => Response.json({ success: true, stopped: accepted }),
      undefined,
      () =>
        createUIMessageStreamResponse({
          stream: new ReadableStream({
            start(c) {
              reader = c;
              c.enqueue({ type: "start", messageId: "minted-answer" });
            },
          }),
          headers: { "x-workflow-run-id": "minted-run" },
        }),
    );
    const oldStop = h.current().stop;
    await mint();
    if (accepted) await ready();
    act(() => h.current().setInput("Minted draft"));
    fireEvent.click(h.getByRole("button", { name: "Send message" }));
    await waitFor(() =>
      expect(h.current().status).toBe(accepted ? "streaming" : "submitted"),
    );
    await act(async () => {
      await oldStop();
      if (accepted) reader.close();
    });
    expect(f.stops()).toHaveLength(1);
    expect(f.stops()[0].url.pathname).toBe("/api/chat/minted-chat/stop");
    expect(f.stops()[0].authorization).toBe("Bearer synthetic-token");
    expect(f.posts()).toHaveLength(accepted ? 1 : 0);
    expect(h.current().stopState?.status).toBe(
      accepted ? "stopped" : "inactive",
    );
    expect(h.current().hasFailedSubmission).toBe(false);
  },
);

it.each(["older admission", "older unknown"] as const)(
  "review admission ordering cannot let %s overwrite a newer outcome",
  async (order) => {
    const older = pending<Response>();
    let posts = 0;
    fixture(async () => {
      if (++posts === 1) {
        await older.promise;
        if (order === "older unknown")
          throw new TypeError("Lost older response");
        return response();
      }
      if (order === "older admission")
        throw new TypeError("Lost newer response");
      return response();
    });
    const lifecycle = createChatRequestLifecycle();
    const transport = createWorkflowChatTransport({
      baseUrl: "https://recoup.invalid",
      getIds: () => ({ chatId: "chat", sessionId: "session" }),
      getAccessToken: async () => "synthetic-token",
      requestLifecycle: lifecycle,
    });
    const first = new Chat({ id: "first", transport });
    const firstSend = first.sendMessage({ text: "Older" });
    await waitFor(() => expect(posts).toBe(1));
    const second = new Chat({ id: "second", transport });
    await second.sendMessage({ text: "Newer" });
    older.resolve(response());
    await firstSend;
    expect(lifecycle.hasUnknownAdmission()).toBe(order === "older admission");
    expect(posts).toBe(2);
  },
);

it.each([false, true])(
  "review Stop invalidates an auth AbortError reaching the outer catch without recovery or replay (dev=%s)",
  async (dev) => {
    environment(dev);
    const f = fixture(() => response());
    const h = await mount();
    await draft(h);
    let rejectToken!: (error: Error) => void;
    external.getAccessToken.mockReturnValueOnce(
      new Promise<string>((_, reject) => {
        rejectToken = reject;
      }),
    );
    let send!: Promise<void>;
    await act(async () => {
      send = h.current().handleSendMessage(event());
    });
    await waitFor(() => expect(h.current().isGeneratingResponse).toBe(true));
    await act(async () => {
      await h.current().stop();
      rejectToken(new DOMException("Cancelled auth", "AbortError"));
      await send;
    });
    expect(h.current().hasFailedSubmission).toBe(false);
    expect(h.current().sendError).toBeUndefined();
    expect(h.current().input).toBe("Retain this draft");
    expect(h.current().attachments).toEqual([image]);
    expect(h.current().textAttachments).toEqual([textFile]);
    await act(async () => {
      await h.current().retrySendMessage?.(event());
    });
    expect(f.posts()).toHaveLength(0);
    expect(f.stops()).toHaveLength(1);
  },
);

it("resends the edited persisted question only after successful deletion through the actual SDK", async () => {
  const f = fixture(() => response());
  const h = await mount();
  const saved = h.current().messages.find((m) => m.role === "user")!;
  const ui = render(
    <QueryClientProvider client={h.client}>
      <VercelChatContext.Provider value={h.current()}>
        <MessageEditor message={saved} setMode={vi.fn()} />
      </VercelChatContext.Provider>
    </QueryClientProvider>,
  );
  fireEvent.change(ui.getByTestId("message-editor"), {
    target: { value: "Edited persisted question" },
  });
  fireEvent.click(ui.getByTestId("message-editor-send-button"));
  await waitFor(() => expect(f.posts()).toHaveLength(1));
  const deletion = f.calls.findIndex((x) => x.method === "DELETE");
  const submission = f.calls.findIndex((x) => x.url.pathname === "/api/chat");
  expect(deletion).toBeGreaterThanOrEqual(0);
  expect(deletion).toBeLessThan(submission);
  expect(f.posts()[0].body!.messages.at(-1)).toMatchObject({
    id: saved.id,
    role: "user",
    parts: [{ type: "text", text: "Edited persisted question" }],
  });
});
