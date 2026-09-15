// @vitest-environment jsdom
import React from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  OrganizationProvider,
  useOrganization,
} from "@/providers/OrganizationProvider";
import { useArtistSelection } from "@/hooks/artists/useArtistSelection";
import type { ArtistRecord } from "@/types/Artist";
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: "user" } }),
}));
const artists = [{ account_id: "a", name: "A" }] as ArtistRecord[];
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <OrganizationProvider>{children}</OrganizationProvider>
);
function useContextUnderTest() {
  const org = useOrganization();
  const selection = useArtistSelection(
    `user:${org.selectedOrgId ?? "personal"}`,
    artists,
  );
  return { ...org, ...selection };
}
afterEach(cleanup);
beforeEach(() => localStorage.clear());
describe("workspace selection", () => {
  it("restores on reload but resets the destination to All artists on explicit workspace changes", async () => {
    localStorage.setItem("selectedOrgId:user", "org");
    localStorage.setItem(
      "RECOUP_ARTIST_SELECTIONS",
      JSON.stringify({ "user:org": artists[0], "user:personal": artists[0] }),
    );
    const { result } = renderHook(useContextUnderTest, { wrapper });
    await waitFor(() => expect(result.current.isInitialized).toBe(true));
    expect(result.current.selectedArtist?.account_id).toBe("a");
    act(() => result.current.setSelectedOrgId(null));
    expect(result.current.selectedArtist).toBeNull();
    act(() => result.current.setSelectedOrgId("org"));
    expect(result.current.selectedArtist).toBeNull();
    expect(
      JSON.parse(localStorage.getItem("RECOUP_ARTIST_SELECTIONS")!)["user:org"],
    ).toBeNull();
  });
  it("keeps workspace and selection unchanged when the composer blocks a switch", async () => {
    const guard = (event: Event) => event.preventDefault();
    const { result } = renderHook(useContextUnderTest, { wrapper });
    await waitFor(() => expect(result.current.isInitialized).toBe(true));
    act(() => result.current.setSelectedArtist(artists[0]));
    window.addEventListener("recoup:context-switch", guard);
    act(() => result.current.setSelectedOrgId("org"));
    window.removeEventListener("recoup:context-switch", guard);
    expect(result.current.selectedOrgId).toBeNull();
    expect(result.current.selectedArtist?.account_id).toBe("a");
  });
});
