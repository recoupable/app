// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  state,
  resetState,
  deferred,
  imageFile,
  receipt,
} from "./publicUpload.fixture";
import useAttachments from "../useAttachments";
import { useTextAttachments } from "../useTextAttachments";
import { usePureFileAttachments } from "../usePureFileAttachments";

const fetchMock = vi.fn();
let count = 0;
beforeEach(() => {
  resetState();
  count = 0;
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal(
    "URL",
    class extends URL {
      static createObjectURL = vi.fn(() => `blob:test-${count++}`);
      static revokeObjectURL = vi.fn();
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});
function useHarness(chatId = "chat-a") {
  const attachments = useAttachments();
  const text = useTextAttachments();
  // The provider mock supplies the real attachment hooks for this harness.
  // eslint-disable-next-line react-hooks/immutability
  state.chat = { id: chatId, sessionId: "session-a", ...attachments, ...text };
  return { ...attachments, ...text, ...usePureFileAttachments() };
}

it("replaces a temporary preview with an authenticated public-storage receipt", async () => {
  const response = deferred<Response>();
  fetchMock.mockReturnValue(response.promise);
  const { result } = renderHook(() => useHarness());
  let pending!: Promise<void>;
  await act(async () => {
    pending = result.current.uploadFile(imageFile());
    await Promise.resolve();
  });
  expect(result.current.attachments[0].url).toBe("blob:test-0");
  expect(result.current.hasPendingUploads).toBe(true);
  await act(async () => {
    response.resolve(receipt());
    await pending;
  });
  expect(result.current.attachments).toEqual([
    expect.objectContaining({
      filename: "cover.png",
      mediaType: "image/png",
      url: expect.stringContaining("/public-uploads/"),
    }),
  ]);
  expect(result.current.hasPendingUploads).toBe(false);
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test-0");
  expect(fetchMock.mock.calls[0][1].headers).toEqual({
    Authorization: "Bearer token-a",
  });
});

it.each(["chat", "artist", "organization", "selected account", "logout"])(
  "does not attach an older response after %s changes",
  async (change) => {
    const response = deferred<Response>();
    fetchMock.mockReturnValue(response.promise);
    const { result, rerender } = renderHook(({ chat }) => useHarness(chat), {
      initialProps: { chat: "chat-a" },
    });
    let pending!: Promise<void>;
    await act(async () => {
      pending = result.current.uploadFile(imageFile());
      await Promise.resolve();
    });
    if (change === "artist")
      state.artist.selectedArtist = { account_id: "artist-b" };
    if (change === "organization") state.org = "org-b";
    if (change === "selected account")
      state.override = {
        email: "other@example.test",
        accountIdOverride: "account-b",
      };
    if (change === "logout") state.auth.authenticated = false;
    rerender({ chat: change === "chat" ? "chat-b" : "chat-a" });
    act(() =>
      result.current.setAttachments([
        {
          type: "file",
          mediaType: "image/png",
          filename: "destination.png",
          url: "https://destination.example/file.png",
        },
      ]),
    );
    await act(async () => {
      response.resolve(receipt());
      await pending;
    });
    expect(result.current.attachments.map((part) => part.filename)).toEqual([
      "destination.png",
    ]);
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    expect(state.error).not.toHaveBeenCalled();
  },
);

it("unmount aborts the upload and revokes its preview", async () => {
  const response = deferred<Response>();
  fetchMock.mockReturnValue(response.promise);
  const { result, unmount } = renderHook(() => useHarness());
  let pending!: Promise<void>;
  await act(async () => {
    pending = result.current.uploadFile(imageFile());
    await Promise.resolve();
  });
  unmount();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test-0");
  expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
  await act(async () => {
    response.resolve(receipt());
    await pending;
  });
});

it("removes its pending preview when the API origin changes before a rerender", async () => {
  const response = deferred<Response>();
  fetchMock.mockReturnValue(response.promise);
  const { result } = renderHook(() => useHarness());
  let pending!: Promise<void>;
  await act(async () => {
    pending = result.current.uploadFile(imageFile());
    await Promise.resolve();
  });
  act(() =>
    result.current.setAttachments((previous) => [
      ...previous,
      {
        type: "file",
        mediaType: "image/png",
        filename: "existing.png",
        url: "https://existing.example/file.png",
      },
    ]),
  );
  expect(result.current.hasPendingUploads).toBe(true);
  // API override storage changes are observable before React commits a render.
  state.origin = "https://other.example";
  await act(async () => {
    response.resolve(receipt());
    await pending;
  });
  expect(result.current.attachments.map((part) => part.filename)).toEqual([
    "existing.png",
  ]);
  expect(result.current.hasPendingUploads).toBe(false);
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test-0");
  expect(state.error).not.toHaveBeenCalled();
});

it("two parallel attachments keep separate previews and results", async () => {
  const first = deferred<Response>();
  const second = deferred<Response>();
  fetchMock
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise);
  const { result } = renderHook(() => useHarness());
  let a!: Promise<void>;
  let b!: Promise<void>;
  await act(async () => {
    a = result.current.uploadFile(imageFile("a.png"));
    b = result.current.uploadFile(imageFile("b.png"));
    await Promise.resolve();
  });
  await act(async () => {
    second.resolve(receipt(imageFile("b.png"), "b"));
    await b;
  });
  expect(result.current.hasPendingUploads).toBe(true);
  await act(async () => {
    first.resolve(receipt(imageFile("a.png"), "a"));
    await a;
  });
  expect(
    result.current.attachments.map((part) => part.url.split("/").pop()),
  ).toEqual(["a", "b"]);
});

it.each([
  ["data.csv", "csv"],
  ["notes.md", "md"],
])(
  "keeps %s as a local text attachment without token or network",
  async (name, kind) => {
    const file = new File(["text"], name);
    Object.defineProperty(file, "text", {
      value: async () => "line one\nline two",
    });
    const { result } = renderHook(() => useHarness());
    await act(async () => {
      await result.current.uploadFile(file);
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(state.auth.getAccessToken).not.toHaveBeenCalled();
    expect(result.current.textAttachments).toEqual([
      {
        filename: name,
        type: kind,
        content: "line one\nline two",
        lineCount: 2,
      },
    ]);
  },
);

it("a delayed local text read cannot attach to a different chat", async () => {
  const text = deferred<string>();
  const file = new File(["text"], "notes.md");
  Object.defineProperty(file, "text", { value: () => text.promise });
  const { result, rerender } = renderHook(({ chat }) => useHarness(chat), {
    initialProps: { chat: "chat-a" },
  });
  let pending!: Promise<void>;
  await act(async () => {
    pending = result.current.uploadFile(file);
  });
  rerender({ chat: "chat-b" });
  await act(async () => {
    text.resolve("old content");
    await pending;
  });
  expect(result.current.textAttachments).toEqual([]);
  expect(fetchMock).not.toHaveBeenCalled();
});

it("reports size/type/session/server failures visibly and removes failed previews", async () => {
  const { result } = renderHook(() => useHarness());
  await act(async () => {
    await result.current.uploadFile(
      new File([new Uint8Array(4 * 1024 * 1024 + 1)], "large.png", {
        type: "image/png",
      }),
    );
  });
  expect(state.error).toHaveBeenLastCalledWith(
    expect.stringContaining("4 MiB"),
  );
  await act(async () => {
    await result.current.uploadFile(
      new File(["unsafe"], "unsafe.html", { type: "text/html" }),
    );
  });
  expect(state.error).toHaveBeenLastCalledWith(
    expect.stringContaining("not supported"),
  );
  expect(fetchMock).not.toHaveBeenCalled();
  state.auth.getAccessToken.mockResolvedValue(null);
  await act(async () => {
    await result.current.uploadFile(imageFile());
  });
  expect(state.error).toHaveBeenLastCalledWith(
    expect.stringContaining("sign in"),
  );
  expect(result.current.attachments).toEqual([]);
  state.auth.getAccessToken.mockResolvedValue("token");
  fetchMock.mockResolvedValue(
    new Response("<html>private storage failure</html>", { status: 500 }),
  );
  await act(async () => {
    await result.current.uploadFile(imageFile());
  });
  expect(state.error).toHaveBeenLastCalledWith(
    "Upload failed. Please try again.",
  );
  expect(result.current.attachments).toEqual([]);
});
