// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAddRosterArtist } from "@/hooks/onboarding/useAddRosterArtist";

const createRosterArtist = vi.fn();
const saveArtist = vi.fn();
const getArtists = vi.fn();
const toastError = vi.fn();

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({ getAccessToken: async () => "token" }),
}));

vi.mock("@/lib/artists/createRosterArtist", () => ({
  createRosterArtist: (...args: unknown[]) => createRosterArtist(...args),
}));

vi.mock("@/lib/saveArtist", () => ({
  default: (...args: unknown[]) => saveArtist(...args),
}));

vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => ({ getArtists }),
}));

vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => ({ selectedOrgId: "org-1" }),
}));

vi.mock("sonner", () => ({
  toast: { error: (...args: unknown[]) => toastError(...args) },
}));

const SPOTIFY = {
  profileUrl: "https://open.spotify.com/artist/43qxAkuKFB6fMNSeS5dO7Z",
  image: "https://i.scdn.co/image/ana.jpg",
};

describe("useAddRosterArtist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createRosterArtist.mockResolvedValue({ account_id: "artist-1" });
    saveArtist.mockResolvedValue(undefined);
  });

  it("enriches a created artist with its Spotify profile and avatar", async () => {
    const { result } = renderHook(() => useAddRosterArtist());

    let added: boolean | undefined;
    await act(async () => {
      added = await result.current.addArtist("Ana Bárbara", SPOTIFY);
    });

    expect(added).toBe(true);
    expect(saveArtist).toHaveBeenCalledWith("token", "artist-1", {
      profileUrls: { SPOTIFY: SPOTIFY.profileUrl },
      image: SPOTIFY.image,
    });
    expect(getArtists).toHaveBeenCalled();
  });

  // POST /api/artists has already succeeded by the time enrichment runs, so a
  // failing PATCH must not report failure: the form would stay open over an
  // artist that exists, and picking again creates a duplicate (chat#1889).
  it("treats a failed enrichment as non-fatal", async () => {
    saveArtist.mockRejectedValue(new Error("Forbidden"));
    const { result } = renderHook(() => useAddRosterArtist());

    let added: boolean | undefined;
    await act(async () => {
      added = await result.current.addArtist("Ana Bárbara", SPOTIFY);
    });

    expect(added).toBe(true);
    expect(getArtists).toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });

  it("still reports failure when the artist itself cannot be created", async () => {
    createRosterArtist.mockRejectedValue(new Error("nope"));
    const { result } = renderHook(() => useAddRosterArtist());

    let added: boolean | undefined;
    await act(async () => {
      added = await result.current.addArtist("Ana Bárbara", SPOTIFY);
    });

    expect(added).toBe(false);
    expect(toastError).toHaveBeenCalled();
    expect(getArtists).not.toHaveBeenCalled();
  });
});
