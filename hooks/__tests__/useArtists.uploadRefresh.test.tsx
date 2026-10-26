// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { state, resetState, deferred } from "./publicUpload.fixture";
const roster = vi.hoisted(() => ({
  refetch: vi.fn(),
  select: vi.fn(),
  save: vi.fn(),
}));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({
    userData: { id: "actor-a", account_id: "account-a" },
  }),
}));
vi.mock("../artists/useArtistsRoster", () => ({
  useArtistsRoster: () => ({ artists: [], refetchArtists: roster.refetch }),
}));
vi.mock("../artists/useArtistSelection", () => ({
  useArtistSelection: () => ({
    selectedArtist: null,
    setSelectedArtist: roster.select,
  }),
}));
vi.mock("@/lib/saveArtist", () => ({ default: roster.save }));
import useArtists from "../useArtists";
import { usePublicUpload } from "../usePublicUpload";
beforeEach(() => {
  resetState();
  roster.save.mockResolvedValue({
    artist: { account_id: "artist-a", name: "A" },
  });
});
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

it("a guarded knowledge save cannot select the old artist when its roster refresh completes in another scope", async () => {
  const refresh = deferred<Array<{ account_id: string; name: string }>>();
  roster.refetch.mockReturnValue(refresh.promise);
  const { result, rerender } = renderHook(() => ({
    artists: useArtists(),
    upload: usePublicUpload(state.org ?? "personal"),
  }));
  act(() =>
    result.current.artists.setEditableArtist({
      account_id: "artist-a",
      name: "A",
    }),
  );
  let pending!: Promise<unknown>;
  await act(async () => {
    const operation = result.current.upload.begin();
    pending = result.current.artists.saveSetting([], operation.isCurrent);
    await Promise.resolve();
    await Promise.resolve();
  });
  expect(roster.refetch).toHaveBeenCalledTimes(1);
  state.org = "org-b";
  rerender();
  await act(async () => {
    refresh.resolve([{ account_id: "artist-a", name: "A" }]);
    expect(await pending).toBeNull();
  });
  expect(roster.select).not.toHaveBeenCalled();
  expect(result.current.artists.updating).toBe(false);
});

it("a token resolved after an account switch cannot start the follow-on profile write", async () => {
  const token = deferred<string>();
  state.auth.getAccessToken.mockReturnValue(token.promise);
  const { result, rerender } = renderHook(() => ({
    artists: useArtists(),
    upload: usePublicUpload("knowledge"),
  }));
  act(() =>
    result.current.artists.setEditableArtist({
      account_id: "artist-a",
      name: "A",
    }),
  );
  let pending!: Promise<unknown>;
  act(() => {
    const operation = result.current.upload.begin();
    pending = result.current.artists.saveSetting([], operation.isCurrent);
  });
  state.auth.authenticated = false;
  rerender();
  await act(async () => {
    token.resolve("old-token");
    expect(await pending).toBeNull();
  });
  expect(roster.save).not.toHaveBeenCalled();
});
