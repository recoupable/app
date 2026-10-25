// @vitest-environment jsdom
import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { UIMessage } from "ai";
import { MessageEditor } from "../message-editor";
const state = vi.hoisted(() => ({
  context: {} as Record<string, unknown>,
  token: vi.fn(async () => "fixture-token"),
}));
vi.mock("@/providers/VercelChatProvider", () => ({
  useVercelChatContext: () => state.context,
}));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({ getAccessToken: state.token }),
}));
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => "https://api.fixture.invalid",
}));
const message: UIMessage = {
  id: "fixture-user",
  role: "user",
  parts: [{ type: "text", text: "Original" }],
};
const suffix: UIMessage = {
  id: "fixture-assistant",
  role: "assistant",
  parts: [{ type: "text", text: "Saved response" }],
};
let messages: UIMessage[];
let current: boolean;
let fetchMock: ReturnType<typeof vi.fn>;
let events: string[];
const setMode = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  messages = [message, suffix];
  current = true;
  events = [];
  state.token.mockResolvedValue("fixture-token");
  state.context = {
    id: "fixture-chat",
    sessionId: "fixture-session",
    messages,
    captureSendIntent: () => () => current,
    editUnacceptedMessage: vi.fn(() => false),
    isMessagePendingAdmission: () => false,
    setMessages: vi.fn(
      (update: UIMessage[] | ((old: UIMessage[]) => UIMessage[])) => {
        events.push("publish");
        messages = typeof update === "function" ? update(messages) : update;
      },
    ),
    reload: vi.fn(() => events.push("reload")),
  };
  fetchMock = vi.fn(async (input, init) => {
    expect(input).toBe(
      "https://api.fixture.invalid/api/chats/fixture-chat/messages/trailing?from_message_id=fixture-user",
    );
    expect(init.method).toBe("DELETE");
    events.push("delete");
    return new Response(null, { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function mount() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MessageEditor message={message} setMode={setMode} />
    </QueryClientProvider>,
  );
}
it.each(["Cancel", "Send"])(
  "%s with unchanged text never deletes or truncates history",
  async (label) => {
    const ui = mount();
    fireEvent.click(ui.getByRole("button", { name: label }));
    await act(async () => {});
    expect(fetchMock).not.toHaveBeenCalled();
    expect(messages).toEqual([message, suffix]);
    expect(state.context.reload).not.toHaveBeenCalled();
    expect(setMode).toHaveBeenCalledWith("view");
  },
);
it("cancel discards only a changed draft without any request", () => {
  const ui = mount();
  fireEvent.change(ui.getByTestId("message-editor"), {
    target: { value: "Changed" },
  });
  fireEvent.click(ui.getByText("Cancel"));
  expect(fetchMock).not.toHaveBeenCalled();
  expect(messages).toEqual([message, suffix]);
});
it.each([404, 409, 500])(
  "shows %s failure, keeps draft and suffix, and never resends automatically",
  async (status) => {
    fetchMock.mockImplementation(async () => new Response(null, { status }));
    const ui = mount();
    fireEvent.change(ui.getByTestId("message-editor"), {
      target: { value: "Changed" },
    });
    fireEvent.click(ui.getByTestId("message-editor-send-button"));
    await waitFor(() => expect(ui.getByRole("alert")).toBeTruthy());
    expect(
      (ui.getByTestId("message-editor") as HTMLTextAreaElement).value,
    ).toBe("Changed");
    expect(messages).toEqual([message, suffix]);
    expect(setMode).not.toHaveBeenCalled();
    expect(state.context.reload).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  },
);
it("waits for deletion success before publishing the submitted edit and resending once", async () => {
  let resolve!: (r: Response) => void;
  fetchMock.mockImplementation(
    () =>
      new Promise<Response>((done) => {
        resolve = done;
        events.push("delete");
      }),
  );
  const ui = mount();
  fireEvent.change(ui.getByTestId("message-editor"), {
    target: { value: "Changed" },
  });
  fireEvent.click(ui.getByTestId("message-editor-send-button"));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  expect(messages).toEqual([message, suffix]);
  expect(
    (ui.getByRole("button", { name: "Cancel" }) as HTMLButtonElement).disabled,
  ).toBe(true);
  expect(
    (ui.getByTestId("message-editor") as HTMLTextAreaElement).disabled,
  ).toBe(true);
  await act(async () => resolve(new Response(null, { status: 200 })));
  await waitFor(() => expect(state.context.reload).toHaveBeenCalledTimes(1));
  expect(events).toEqual(["delete", "publish", "reload"]);
  expect(messages).toEqual([
    { ...message, parts: [{ type: "text", text: "Changed" }] },
  ]);
});
it.each(["auth", "response"])(
  "does not publish late results after current account/chat intent changes during %s",
  async (stage) => {
    let resolve!: () => void;
    if (stage === "auth")
      state.token.mockImplementationOnce(
        () =>
          new Promise((done) => {
            resolve = () => done("fixture-token");
          }),
      );
    else
      fetchMock.mockImplementation(
        () =>
          new Promise((done) => {
            resolve = () => done(new Response(null, { status: 200 }));
          }),
      );
    const ui = mount();
    fireEvent.change(ui.getByTestId("message-editor"), {
      target: { value: "Changed" },
    });
    fireEvent.click(ui.getByTestId("message-editor-send-button"));
    await waitFor(() =>
      expect(stage === "auth" ? state.token : fetchMock).toHaveBeenCalledTimes(
        1,
      ),
    );
    current = false;
    await act(async () => resolve());
    expect(messages).toEqual([message, suffix]);
    expect(state.context.reload).not.toHaveBeenCalled();
    expect(setMode).not.toHaveBeenCalled();
  },
);

it("requires a successful unchanged-history check and a separate explicit Send after failure", async () => {
  let allowDelete = false;
  fetchMock.mockImplementation(async (url, init) => {
    if (init?.method === "DELETE")
      return new Response(null, { status: allowDelete ? 200 : 500 });
    expect(url).toBe(
      "https://api.fixture.invalid/api/sessions/fixture-session/chats/fixture-chat",
    );
    return Response.json({ messages: [message, suffix] });
  });
  const ui = mount();
  fireEvent.change(ui.getByTestId("message-editor"), {
    target: { value: "Changed" },
  });
  fireEvent.click(ui.getByTestId("message-editor-send-button"));
  await waitFor(() => expect(ui.getByRole("alert")).toBeTruthy());
  expect(
    (ui.getByTestId("message-editor-send-button") as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  allowDelete = true;
  fireEvent.click(ui.getByText("Check saved history"));
  await waitFor(() => expect(ui.queryByRole("alert")).toBeNull());
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(messages).toEqual([message, suffix]);
  expect(state.context.reload).not.toHaveBeenCalled();
  fireEvent.click(ui.getByTestId("message-editor-send-button"));
  await waitFor(() => expect(state.context.reload).toHaveBeenCalledTimes(1));
  expect(fetchMock).toHaveBeenCalledTimes(3);
});
it("keeps an uncertain committed delete from being blindly retried when saved history changed", async () => {
  fetchMock.mockImplementation(async (_url, init) =>
    init?.method === "DELETE"
      ? new Response(null, { status: 500 })
      : Response.json({ messages: [] }),
  );
  const ui = mount();
  fireEvent.change(ui.getByTestId("message-editor"), {
    target: { value: "Changed" },
  });
  fireEvent.click(ui.getByTestId("message-editor-send-button"));
  await waitFor(() => expect(ui.getByRole("alert")).toBeTruthy());
  fireEvent.click(ui.getByText("Check saved history"));
  await waitFor(() =>
    expect(ui.getByRole("alert").textContent).toContain(
      "Saved history changed",
    ),
  );
  expect(messages).toEqual([message, suffix]);
  expect((ui.getByTestId("message-editor") as HTMLTextAreaElement).value).toBe(
    "Changed",
  );
  expect(
    (ui.getByTestId("message-editor-send-button") as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  expect(state.context.reload).not.toHaveBeenCalled();
  fireEvent.click(ui.getByText("Cancel"));
  expect(messages).toEqual([]);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
it("retains draft and suffix when the saved-history check fails, then allows an explicit check retry", async () => {
  let readFails = true;
  fetchMock.mockImplementation(async (_url, init) =>
    init?.method === "DELETE" || readFails
      ? new Response(null, { status: 500 })
      : Response.json({ messages: [message, suffix] }),
  );
  const ui = mount();
  fireEvent.change(ui.getByTestId("message-editor"), {
    target: { value: "Changed" },
  });
  fireEvent.click(ui.getByTestId("message-editor-send-button"));
  await waitFor(() => expect(ui.getByRole("alert")).toBeTruthy());
  fireEvent.click(ui.getByText("Check saved history"));
  await waitFor(() =>
    expect(ui.getByRole("alert").textContent).toContain(
      "Retry checking history",
    ),
  );
  expect(messages).toEqual([message, suffix]);
  expect(state.context.reload).not.toHaveBeenCalled();
  readFails = false;
  fireEvent.click(ui.getByText("Check saved history"));
  await waitFor(() => expect(ui.queryByRole("alert")).toBeNull());
  expect(fetchMock).toHaveBeenCalledTimes(3);
  expect(state.context.reload).not.toHaveBeenCalled();
});
it("suppresses late history-check state after account intent changes", async () => {
  let resolve!: (r: Response) => void;
  fetchMock.mockImplementation(async (_url, init) =>
    init?.method === "DELETE"
      ? new Response(null, { status: 409 })
      : new Promise<Response>((done) => {
          resolve = done;
        }),
  );
  const ui = mount();
  fireEvent.change(ui.getByTestId("message-editor"), {
    target: { value: "Changed" },
  });
  fireEvent.click(ui.getByTestId("message-editor-send-button"));
  await waitFor(() => expect(ui.getByRole("alert")).toBeTruthy());
  fireEvent.click(ui.getByText("Check saved history"));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  current = false;
  await act(async () => resolve(Response.json({ messages: [] })));
  expect(ui.getByRole("alert").textContent).not.toContain(
    "Saved history changed",
  );
  expect(messages).toEqual([message, suffix]);
  expect(state.context.reload).not.toHaveBeenCalled();
});
