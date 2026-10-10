// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { source, tracking } from "./releaseStreamHookFixture";
import { useReleaseStreams } from "../useReleaseStreams";
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
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
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
  act(() => result.current.selectCatalog("a"));
  await waitFor(() => expect(result.current.history).toBeTruthy());
  await act(async () => {
    await result.current.enable();
  });
  expect(source.request.mock.calls.find((call) => call[3])).toMatchObject({
    0: "catalogs/a/stream-tracking",
    3: { action: "enable" },
  });
  await waitFor(() => expect(source.history).toHaveBeenCalledTimes(2));
});
