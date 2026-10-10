// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { source, tracking } from "./releaseStreamHookFixture";
import { useCatalogStreamRead } from "../useCatalogStreamRead";
const token = async () => "viewer";
it("bounds polling when collection remains queued", async () => {
  vi.useFakeTimers();
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  source.history.mockResolvedValue({ catalog_id: "a" });
  source.request.mockResolvedValue(tracking("a", "queued"));
  renderHook(() => useCatalogStreamRead("a", 28, 0, token));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(600000);
  });
  expect(source.history).toHaveBeenCalledTimes(30);
  expect(vi.getTimerCount()).toBe(0);
});
it("does not poll a hidden tab after its initial read", async () => {
  vi.useFakeTimers();
  vi.spyOn(document, "hidden", "get").mockReturnValue(true);
  source.history.mockResolvedValue({ catalog_id: "a" });
  source.request.mockResolvedValue(tracking("a", "running"));
  renderHook(() => useCatalogStreamRead("a", 28, 0, token));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(600000);
  });
  expect(source.history).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(0);
});

it("retains saved data across a transient background failure and retries", async () => {
  vi.useFakeTimers();
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  source.history
    .mockResolvedValueOnce({ catalog_id: "a" })
    .mockRejectedValueOnce(new Error("Could not load streams. Please retry."))
    .mockResolvedValue({ catalog_id: "a" });
  source.request.mockResolvedValue(tracking("a", "queued"));
  const { result } = renderHook(() => useCatalogStreamRead("a", 28, 0, token));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10000);
  });
  expect(result.current.history?.catalog_id).toBe("a");
  expect(result.current.tracking?.latest_run?.status).toBe("queued");
  expect(result.current.error).toContain("retry");
  await act(async () => {
    await vi.advanceTimersByTimeAsync(20000);
  });
  expect(source.history).toHaveBeenCalledTimes(3);
  expect(result.current.error).toBe("");
});
