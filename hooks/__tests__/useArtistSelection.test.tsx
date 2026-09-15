// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useArtistSelection } from "@/hooks/artists/useArtistSelection";
import type { ArtistRecord } from "@/types/Artist";

const artists = [
  { account_id: "a", name: "Artist A" },
  { account_id: "b", name: "Artist B" },
] as ArtistRecord[];
afterEach(cleanup);
beforeEach(() => localStorage.clear());
describe("artist context", () => {
  it("starts with All artists and does not auto-select when the roster arrives", () => {
    const { result, rerender } = renderHook(
      ({ roster }) => useArtistSelection("user:personal", roster),
      { initialProps: { roster: [] as ArtistRecord[] } },
    );
    rerender({ roster: artists });
    expect(result.current.selectedArtist).toBeNull();
  });
  it("restores an artist after remount, and keeps All artists after clearing and remounting", () => {
    const first = renderHook(() =>
      useArtistSelection("user:personal", artists),
    );
    act(() => first.result.current.setSelectedArtist(artists[1]));
    first.unmount();
    const second = renderHook(() =>
      useArtistSelection("user:personal", artists),
    );
    expect(second.result.current.selectedArtist?.account_id).toBe("b");
    act(() => second.result.current.setSelectedArtist(null));
    second.unmount();
    const third = renderHook(() =>
      useArtistSelection("user:personal", artists),
    );
    expect(third.result.current.selectedArtist).toBeNull();
  });
  it("does not leak a choice to another user or select an artist absent from the roster", () => {
    const { result, rerender } = renderHook(
      ({ scope, roster }) => useArtistSelection(scope, roster),
      { initialProps: { scope: "one:personal", roster: artists } },
    );
    act(() => result.current.setSelectedArtist(artists[0]));
    rerender({ scope: "two:personal", roster: artists });
    expect(result.current.selectedArtist).toBeNull();
    rerender({ scope: "one:personal", roster: [artists[1]] });
    expect(result.current.selectedArtist).toBeNull();
  });
});
