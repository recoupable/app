// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";
import { source, tracking } from "./releaseStreamHookFixture";
import { useReleaseStreams } from "../useReleaseStreams";
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
  expect(source.request).toHaveBeenCalledTimes(1);
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
