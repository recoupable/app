// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useReleaseStreams } from "../useReleaseStreams";
const source = vi.hoisted(() => ({
  catalogs: vi.fn(),
  history: vi.fn(),
  request: vi.fn(),
}));
vi.mock("@/lib/releases/getReleaseStreamCatalogs", () => ({
  getReleaseStreamCatalogs: source.catalogs,
}));
vi.mock("@/lib/releases/getReleaseStreamHistory", () => ({
  getReleaseStreamHistory: source.history,
}));
vi.mock("@/lib/releases/requestStreamData", () => ({
  requestStreamData: source.request,
}));
const tracking = (id: string, status = "complete") => ({
  catalog_id: id,
  tracking: { enabled: true },
  latest_run: { status, finished_at: null },
});
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  vi.useRealTimers();
});
it("requires catalog selection when several catalogs exist; selecting never starts collection", async () => {
  source.catalogs.mockResolvedValue([
    { id: "a", name: "A" },
    { id: "b", name: "B" },
  ]);
  source.history.mockResolvedValue({ catalog_id: "a" });
  source.request.mockResolvedValue(tracking("a"));
  const { result } = renderHook(() =>
    useReleaseStreams("workspace", async () => "token"),
  );
  await waitFor(() => expect(result.current.catalogsLoading).toBe(false));
  expect(source.history).not.toHaveBeenCalled();
  await act(async () => result.current.selectCatalog("a"));
  await waitFor(() => expect(result.current.history).toBeTruthy());
  expect(source.request.mock.calls[0]).toHaveLength(3);
  expect(source.catalogs.mock.calls[0][0]).toBe("workspace");
});
it("ignores a previous catalog response after selecting another catalog", async () => {
  source.catalogs.mockResolvedValue([
    { id: "a", name: "A" },
    { id: "b", name: "B" },
  ]);
  let finish!: (value: unknown) => void;
  source.history.mockImplementation((id) =>
    id === "a"
      ? new Promise((resolve) => {
          finish = resolve;
        })
      : Promise.resolve({ catalog_id: "b" }),
  );
  source.request.mockImplementation((path) =>
    Promise.resolve(tracking(path.includes("/a/") ? "a" : "b")),
  );
  const { result } = renderHook(() =>
    useReleaseStreams("workspace", async () => "token"),
  );
  await waitFor(() => expect(result.current.catalogsLoading).toBe(false));
  act(() => result.current.selectCatalog("a"));
  await waitFor(() => expect(finish).toBeDefined());
  act(() => result.current.selectCatalog("b"));
  await waitFor(() => expect(result.current.history?.catalog_id).toBe("b"));
  await act(async () => finish({ catalog_id: "a" }));
  expect(result.current.history?.catalog_id).toBe("b");
});
it("clears displayed history after permission failure on refresh", async () => {
  source.catalogs.mockResolvedValue([{ id: "a", name: "A" }]);
  source.history.mockResolvedValue({ catalog_id: "a" });
  source.request.mockResolvedValue(tracking("a"));
  const { result } = renderHook(() =>
    useReleaseStreams("workspace", async () => "token"),
  );
  await waitFor(() => expect(result.current.history).toBeTruthy());
  source.history.mockRejectedValue(
    new Error("Stream data is unavailable in this workspace."),
  );
  act(() => result.current.refresh());
  expect(result.current.history).toBeNull();
  await waitFor(() => expect(result.current.error).toContain("unavailable"));
  expect(result.current.history).toBeNull();
});
it("aborts catalog work on unmount before token or data can complete", async () => {
  source.catalogs.mockImplementation(() => new Promise(() => {}));
  const { unmount } = renderHook(() =>
    useReleaseStreams("workspace", async () => "token"),
  );
  const signal = source.catalogs.mock.calls[0][2] as AbortSignal;
  unmount();
  expect(signal.aborted).toBe(true);
});

it("polls a queued collection and stops when saved history is complete", async () => {
  vi.useFakeTimers();
  source.catalogs.mockResolvedValue([{ id: "a", name: "A" }]);
  source.history.mockResolvedValue({ catalog_id: "a" });
  source.request
    .mockResolvedValueOnce(tracking("a", "queued"))
    .mockResolvedValue(tracking("a"));
  const { result } = renderHook(() =>
    useReleaseStreams("workspace", async () => "token"),
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
  expect(result.current.tracking?.latest_run?.status).toBe("queued");
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10000);
  });
  expect(result.current.tracking?.latest_run?.status).toBe("complete");
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10000);
  });
  expect(source.history).toHaveBeenCalledTimes(2);
});
it("enables only the explicitly selected catalog and reloads saved history", async () => {
  source.catalogs.mockResolvedValue([{ id: "a", name: "A" }]);
  source.history.mockResolvedValue({ catalog_id: "a" });
  source.request.mockResolvedValue(tracking("a"));
  const { result } = renderHook(() =>
    useReleaseStreams("workspace", async () => "token"),
  );
  await waitFor(() => expect(result.current.history).toBeTruthy());
  await act(async () => {
    await result.current.enable();
  });
  expect(source.request.mock.calls.find((call) => call[3])).toMatchObject({
    0: "catalogs/a/stream-tracking",
    3: { action: "enable" },
  });
});
