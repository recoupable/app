// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { useVercelChat } from "../useVercelChat";

const ext = vi.hoisted(() => ({
  account: "selected-b" as string | null,
  email: "b@example.test" as string | null,
  origin: "https://api.example.test",
  token: vi.fn(async () => "synthetic-token"),
  headers: vi.fn(async () => ({ Authorization: "Bearer synthetic-token" })),
  send: vi.fn(),
  files: [{ id: "draft.txt", path: "draft.txt", mime_type: "text/plain" }],
  messages: [],
  lifecycle: { cancelAll: vi.fn() },
  snapshots: { captureSendIntent: () => () => true },
}));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    authenticated: true,
    user: { id: "actor" },
    getAccessToken: ext.token,
  }),
}));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: "self-a" } }),
}));
vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => ({ selectedArtist: null }),
}));
vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => ({ selectedOrgId: null, isInitialized: true }),
}));
vi.mock("@/providers/AccountOverrideProvider", () => ({
  useAccountOverride: () => ({
    accountIdOverride: ext.account,
    email: ext.email,
  }),
}));
vi.mock("@/providers/PaymentProvider", () => ({
  usePaymentProvider: () => ({ refetchCredits: vi.fn() }),
}));
vi.mock("@/providers/ConversationsProvider", () => ({
  useConversationsProvider: () => ({ addOptimisticConversation: vi.fn() }),
}));
vi.mock("@/hooks/useAvailableModels", () => ({
  default: () => ({ data: [] }),
}));
vi.mock("@/hooks/useArtistFilesForMentions", () => ({
  default: () => ({ files: ext.files }),
}));
vi.mock("@/hooks/useMessageLoader", () => ({
  useMessageLoader: () => ({ isLoading: false, hasError: false }),
}));
vi.mock("@/hooks/usePersistSelectedModel", () => ({
  usePersistSelectedModel: () => async () => {},
}));
vi.mock("@/hooks/useDeleteTrailingMessages", () => ({
  useDeleteTrailingMessages: () => ({ deleteTrailingMessages: vi.fn() }),
}));
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => ext.origin,
}));
vi.mock("next/navigation", () => ({ useParams: () => ({ chatId: "chat" }) }));
vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    messages: ext.messages,
    status: "ready",
    sendMessage: ext.send,
    regenerate: vi.fn(),
    setMessages: vi.fn(),
    stop: vi.fn(),
  }),
}));
vi.mock("@/hooks/useChatTransport", () => ({
  useChatTransport: () => ({
    transport: {},
    getHeaders: ext.headers,
    snapshotConsumer: ext.snapshots,
    requestLifecycle: ext.lifecycle,
  }),
}));
const fetchMock = vi.fn();
const submit = { preventDefault() {} } as React.FormEvent<HTMLFormElement>;
const mount = () =>
  renderHook(() => useVercelChat({ id: "chat", sessionId: "session" }));
const response = (account: string | null, content: string) =>
  Response.json({
    status: "success",
    ...(account && { account_id: account }),
    content,
  });
beforeEach(() => {
  ext.account = "selected-b";
  ext.email = "b@example.test";
  ext.origin = "https://api.example.test";
  ext.token.mockReset().mockResolvedValue("synthetic-token");
  ext.headers
    .mockReset()
    .mockResolvedValue({ Authorization: "Bearer synthetic-token" });
  ext.send
    .mockReset()
    .mockImplementation(async (_message, request) =>
      request.metadata.onAccepted({ chatId: "chat", sessionId: "session" }),
    );
  fetchMock.mockReset().mockImplementation(async (url) => {
    const account = new URL(url).searchParams.get("account_id");
    return response(account, account ?? "private-self-a");
  });
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "false");
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("attaches the selected account's file bytes, not the same path from self", async () => {
  const { result } = mount();
  act(() => result.current.setInput("Use @[Draft](draft.txt)"));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(result.current.isLoadingSignedUrls).toBe(false));
  await act(async () => {
    await result.current.handleSendMessage(submit);
  });
  expect(
    new URL(fetchMock.mock.calls[0][0]).searchParams.get("account_id"),
  ).toBe("selected-b");
  expect(ext.send).toHaveBeenCalledTimes(1);
  expect(JSON.stringify(ext.send.mock.calls[0][0])).toContain("selected-b");
  expect(JSON.stringify(ext.send.mock.calls[0][0])).not.toContain(
    "private-self-a",
  );
  expect(ext.send.mock.calls[0][1].body.accountId).toBe("selected-b");
});

it("blocks plain sends and captured self intents while a selected email is unresolved", async () => {
  ext.account = null;
  ext.email = null;
  const { result, rerender } = mount();
  const oldIntent = result.current.captureSendIntent();
  const oldSend = result.current.handleSendMessage;
  act(() => result.current.setInput("Keep this draft"));
  ext.email = "waiting@example.test";
  rerender();
  expect(oldIntent()).toBe(false);
  await act(async () => {
    await oldSend(submit);
    await result.current.handleSendMessage(submit);
  });
  expect(ext.send).not.toHaveBeenCalled();
  expect(ext.headers).not.toHaveBeenCalled();
  expect(result.current.input).toBe("Keep this draft");
});

it("blocks attachment submission when an older API does not acknowledge the target", async () => {
  fetchMock.mockResolvedValue(response(null, "private-self-a"));
  const { result } = mount();
  act(() => result.current.setInput("Use @[Draft](draft.txt)"));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(result.current.isLoadingSignedUrls).toBe(false));
  await act(async () => {
    await result.current.handleSendMessage(submit);
  });
  expect(ext.send).not.toHaveBeenCalled();
  expect(result.current.input).toContain("Draft");
});

it("cannot submit old mention bytes during a new account's pending read", async () => {
  const { result, rerender } = mount();
  act(() => result.current.setInput("Use @[Draft](draft.txt)"));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(result.current.isLoadingSignedUrls).toBe(false));
  let resolve!: (value: Response) => void;
  fetchMock.mockReturnValueOnce(
    new Promise<Response>((done) => {
      resolve = done;
    }),
  );
  ext.account = "selected-c";
  ext.email = "c@example.test";
  rerender();
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  await act(async () => {
    await result.current.handleSendMessage(submit);
  });
  expect(ext.send).not.toHaveBeenCalled();
  await act(async () => resolve(response("selected-c", "selected-c")));
  await waitFor(() => expect(result.current.isLoadingSignedUrls).toBe(false));
  await act(async () => {
    await result.current.handleSendMessage(submit);
  });
  expect(JSON.stringify(ext.send.mock.calls[0][0])).toContain("selected-c");
  expect(JSON.stringify(ext.send.mock.calls[0][0])).not.toContain("selected-b");
});

it("keeps the deep-link send pending until the selected account resolves", async () => {
  ext.account = null;
  const initialMessages = [
    {
      id: "query",
      role: "user" as const,
      parts: [{ type: "text" as const, text: "Deep link draft" }],
    },
  ];
  const { result, rerender } = renderHook(() =>
    useVercelChat({ id: "chat", sessionId: "session", initialMessages }),
  );
  await waitFor(() => expect(result.current.input).toBe("Deep link draft"));
  expect(ext.send).not.toHaveBeenCalled();
  ext.account = "selected-b";
  rerender();
  await waitFor(() => expect(ext.send).toHaveBeenCalledTimes(1));
  expect(ext.send.mock.calls[0][1].body.accountId).toBe("selected-b");
});
