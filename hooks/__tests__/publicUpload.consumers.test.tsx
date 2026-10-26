// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  state,
  resetState,
  deferred,
  imageFile,
  inputEvent,
  receipt,
} from "./publicUpload.fixture";
import useUser from "../useUser";
import useArtistSetting from "../useArtistSetting";
import useOrgSettings from "../useOrgSettings";
import useSaveKnowledgeEdit from "../useSaveKnowledgeEdit";
const fetchMock = vi.fn();
beforeEach(() => {
  resetState();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

it("profile image uses bearer API upload and the newest selection wins", async () => {
  const first = deferred<Response>();
  const second = deferred<Response>();
  fetchMock
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise);
  const { result } = renderHook(() => useUser());
  let a!: Promise<void>;
  let b!: Promise<void>;
  await act(async () => {
    a = result.current.handleImageSelected(inputEvent(imageFile("first.png")));
    await Promise.resolve();
  });
  await act(async () => {
    b = result.current.handleImageSelected(inputEvent(imageFile("second.png")));
    await Promise.resolve();
  });
  expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
  await act(async () => {
    second.resolve(receipt(imageFile("second.png"), "second"));
    await b;
  });
  expect(result.current.image).toContain("/second");
  await act(async () => {
    first.resolve(receipt(imageFile("first.png"), "first"));
    await a;
  });
  expect(result.current.image).toContain("/second");
  expect(result.current.imageUploading).toBe(false);
  expect(fetchMock.mock.calls[1][0]).toBe("https://api.example/api/upload");
  expect(fetchMock.mock.calls[1][1].headers).toEqual({
    Authorization: "Bearer token-a",
  });
});

it("profile sign-out cancels a pending token before the upload can start", async () => {
  const token = deferred<string>();
  state.auth.getAccessToken.mockReturnValue(token.promise);
  const { result } = renderHook(() => useUser());
  let pending!: Promise<void>;
  await act(async () => {
    pending = result.current.handleImageSelected(inputEvent(imageFile()));
  });
  await act(async () => {
    await result.current.signOut();
  });
  await act(async () => {
    token.resolve("old");
    await pending;
  });
  expect(fetchMock).not.toHaveBeenCalled();
  expect(result.current.image).toBe("");
  expect(state.error).not.toHaveBeenCalled();
});

it("profile remove cancels an in-flight selection rather than restoring it later", async () => {
  const response = deferred<Response>();
  fetchMock.mockReturnValue(response.promise);
  const { result } = renderHook(() => useUser());
  let pending!: Promise<void>;
  await act(async () => {
    pending = result.current.handleImageSelected(inputEvent(imageFile()));
    await Promise.resolve();
  });
  act(() => result.current.removeImage());
  await act(async () => {
    response.resolve(receipt());
    await pending;
  });
  expect(result.current.image).toBe("");
  expect(result.current.imageUploading).toBe(false);
});

it("an artist switch cannot receive an earlier image or knowledge upload", async () => {
  const image = deferred<Response>();
  const knowledge = deferred<Response>();
  fetchMock
    .mockReturnValueOnce(image.promise)
    .mockReturnValueOnce(knowledge.promise);
  const { result } = renderHook(() => useArtistSetting());
  act(() =>
    result.current.setEditableArtist({ account_id: "artist-a", name: "A" }),
  );
  let pendingImage!: Promise<void>;
  let pendingKnowledge!: Promise<void>;
  await act(async () => {
    pendingImage = result.current.handleImageSelected(inputEvent(imageFile()));
    pendingKnowledge = result.current.handleKnowledgesSelected(
      inputEvent(imageFile("knowledge.png")),
    );
    await Promise.resolve();
  });
  act(() =>
    result.current.setEditableArtist({
      account_id: "artist-b",
      name: "B",
      image: "b-image",
      knowledges: [],
    }),
  );
  await act(async () => {
    image.resolve(receipt());
    knowledge.resolve(receipt(imageFile("knowledge.png")));
    await Promise.all([pendingImage, pendingKnowledge]);
  });
  expect(result.current.image).toBe("b-image");
  expect(result.current.bases).toEqual([]);
  expect(result.current.imageUploading).toBe(false);
  expect(result.current.knowledgeUploading).toBe(false);
});

it("concurrent artist knowledge batches append without losing the other result", async () => {
  const first = deferred<Response>();
  const second = deferred<Response>();
  fetchMock
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise);
  const { result } = renderHook(() => useArtistSetting());
  let a!: Promise<void>;
  let b!: Promise<void>;
  await act(async () => {
    a = result.current.handleKnowledgesSelected(inputEvent(imageFile("a.png")));
    b = result.current.handleKnowledgesSelected(inputEvent(imageFile("b.png")));
    await Promise.resolve();
  });
  await act(async () => {
    second.resolve(receipt(imageFile("b.png"), "b"));
    await b;
  });
  await act(async () => {
    first.resolve(receipt(imageFile("a.png"), "a"));
    await a;
  });
  expect(result.current.bases.map((file) => file.name)).toEqual([
    "b.png",
    "a.png",
  ]);
});

it("organization image and batch uploads do not leak into a newly selected organization", async () => {
  const response = deferred<Response>();
  fetchMock.mockReturnValue(response.promise);
  const { result, rerender } = renderHook(({ org }) => useOrgSettings(org), {
    initialProps: { org: "org-a" },
  });
  let pending!: Promise<void>;
  await act(async () => {
    pending = result.current.handleKnowledgesSelected(inputEvent(imageFile()));
    await Promise.resolve();
  });
  rerender({ org: "org-b" });
  await act(async () => {
    response.resolve(receipt());
    await pending;
  });
  expect(result.current.knowledges).toEqual([]);
  expect(result.current.knowledgeUploading).toBe(false);
});

it("unmounted settings never display a delayed upload error", async () => {
  const response = deferred<Response>();
  fetchMock.mockReturnValue(response.promise);
  const { result, unmount } = renderHook(() => useOrgSettings("org-a"));
  let pending!: Promise<void>;
  await act(async () => {
    pending = result.current.handleImageSelected(inputEvent(imageFile()));
    await Promise.resolve();
  });
  unmount();
  await act(async () => {
    response.resolve(new Response("error", { status: 500 }));
    await pending;
  });
  expect(state.error).not.toHaveBeenCalled();
});

it("knowledge editing never saves an upload after switching artists", async () => {
  const response = deferred<Response>();
  fetchMock.mockReturnValue(response.promise);
  const { result, rerender } = renderHook(() =>
    useSaveKnowledgeEdit({
      name: "notes.txt",
      url: "https://old.example/notes.txt",
      editedText: "edited",
    }),
  );
  let pending!: Promise<boolean>;
  await act(async () => {
    pending = result.current.handleSave();
    await Promise.resolve();
  });
  state.artist.editableArtist = { account_id: "artist-b" };
  rerender();
  await act(async () => {
    response.resolve(
      receipt(new File(["edited"], "notes.txt", { type: "text/plain" })),
    );
    await pending;
  });
  expect(state.artist.saveSetting).not.toHaveBeenCalled();
  expect(state.artist.setBases).not.toHaveBeenCalled();
  expect(state.success).not.toHaveBeenCalled();
});

it("valid knowledge edits save only after the authenticated upload and pass a live write guard", async () => {
  fetchMock.mockResolvedValue(
    receipt(new File(["edited"], "notes.txt", { type: "text/plain" })),
  );
  const { result } = renderHook(() =>
    useSaveKnowledgeEdit({
      name: "notes.txt",
      url: "https://old.example/notes.txt",
      editedText: "edited",
    }),
  );
  await act(async () => {
    expect(await result.current.handleSave()).toBe(true);
  });
  expect(state.artist.saveSetting).toHaveBeenCalledWith(
    [
      expect.objectContaining({
        url: expect.stringContaining("/public-uploads/"),
      }),
    ],
    expect.any(Function),
  );
  expect(state.artist.setBases).toHaveBeenCalledTimes(1);
  expect(state.success).toHaveBeenCalledWith("Saved");
});

it("invalid JSON does not upload and gives an actionable correction", async () => {
  const { result } = renderHook(() =>
    useSaveKnowledgeEdit({
      name: "data.json",
      url: "https://old.example/data.json",
      editedText: "{bad",
    }),
  );
  await act(async () => {
    expect(await result.current.handleSave()).toBe(false);
  });
  expect(fetchMock).not.toHaveBeenCalled();
  expect(state.error).toHaveBeenCalledWith(
    "Invalid JSON. Correct the JSON before saving.",
  );
});
