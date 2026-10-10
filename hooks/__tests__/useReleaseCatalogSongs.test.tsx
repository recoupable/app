// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useReleaseCatalogSongs } from "../useReleaseCatalogSongs";
const source = vi.hoisted(() => ({ read: vi.fn() }));
vi.mock("@/lib/releases/getReleaseCatalogSongs", () => ({
  getReleaseCatalogSongs: source.read,
}));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
it("hides old metadata immediately and ignores a cancelled catalog response", async () => {
  let resolveOld!: (songs: unknown[]) => void;
  source.read.mockImplementation((id: string) =>
    id === "old"
      ? new Promise((resolve) => {
          resolveOld = resolve;
        })
      : Promise.resolve([
          { isrc: "USABC2600002", name: "New", album: "New album" },
        ]),
  );
  const token = async () => "viewer";
  const { result, rerender } = renderHook(
    ({ id }) => useReleaseCatalogSongs(id, token),
    { initialProps: { id: "old" } },
  );
  const signal = source.read.mock.calls[0][2] as AbortSignal;
  rerender({ id: "new" });
  expect(signal.aborted).toBe(true);
  expect(result.current.songs).toEqual([]);
  await waitFor(() => expect(result.current.songs[0]?.name).toBe("New"));
  await act(async () =>
    resolveOld([{ isrc: "USABC2600001", name: "Old", album: "Old album" }]),
  );
  expect(result.current.songs[0].name).toBe("New");
  rerender({ id: "" });
  expect(result.current.songs).toEqual([]);
});
it("refreshes metadata and clears the previous data on an access failure", async () => {
  source.read
    .mockResolvedValueOnce([
      { isrc: "USABC2600001", name: "Song", album: "Album" },
    ])
    .mockRejectedValueOnce(
      new Error("Stream data is unavailable in this workspace."),
    );
  const { result } = renderHook(() =>
    useReleaseCatalogSongs("catalog", async () => "viewer"),
  );
  await waitFor(() => expect(result.current.songs).toHaveLength(1));
  act(() => result.current.refresh());
  expect(result.current.songs).toEqual([]);
  await waitFor(() => expect(result.current.error).toContain("unavailable"));
  expect(result.current.songs).toEqual([]);
});
