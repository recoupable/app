// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { context, fetchMock, wrapper } from "./taskRunScope.fixture";
import useHomeTasksModuleState from "../useHomeTasksModuleState";
const tasks = vi.hoisted(() => ({ existing: null as null | { id: string } }));
vi.mock("@/hooks/useScheduledActions", () => ({
  useScheduledActions: () => ({
    data: tasks.existing ? [tasks.existing] : [],
    isSuccess: true,
    isLoading: false,
  }),
}));
vi.mock("@/lib/onboarding/findExistingWeeklyReportTask", () => ({
  findExistingWeeklyReportTask: () => tasks.existing,
}));
vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => ({ selectedArtist: { account_id: "artist-a" } }),
}));
it.each([true, false])(
  "never substitutes a self schedule/starter for an empty selected account (self schedule: %s)",
  async (exists) => {
    tasks.existing = exists ? { id: "self-task" } : null;
    context.account = "target-b";
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ runs: [] }) });
    const { result } = renderHook(() => useHomeTasksModuleState(), { wrapper });
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await waitFor(() => expect(result.current.accountId).toBe("target-b"));
    expect(result.current.view).toBe("hidden");
  },
);
it.each([true, false])(
  "retains normal self fallback (self schedule: %s)",
  async (exists) => {
    tasks.existing = exists ? { id: "self-task" } : null;
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ runs: [] }) });
    const { result } = renderHook(() => useHomeTasksModuleState(), { wrapper });
    await waitFor(() =>
      expect(result.current.view).toBe(exists ? "scheduled" : "starter"),
    );
  },
);
