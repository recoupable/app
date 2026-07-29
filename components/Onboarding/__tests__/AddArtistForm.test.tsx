// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AddArtistForm from "@/components/Onboarding/AddArtistForm";

const add = vi.fn();

const SPOTIFY_RESULT = {
  id: "3TVXtAsR1Inumwj472S9r4",
  name: "Drake",
  external_urls: {
    spotify: "https://open.spotify.com/artist/3TVXtAsR1Inumwj472S9r4",
  },
  images: [{ url: "https://i.scdn.co/image/drake.jpg" }],
  followers: { total: 92000000 },
};

vi.mock("@/hooks/useAddSpotifyArtist", () => ({
  useAddSpotifyArtist: () => ({ add, isAdding: false }),
}));

vi.mock("@/hooks/useSpotifyArtistSearch", () => ({
  useSpotifyArtistSearch: () => ({
    results: [SPOTIFY_RESULT],
    isSearching: false,
  }),
}));

describe("AddArtistForm", () => {
  beforeEach(() => {
    add.mockClear();
    add.mockResolvedValue(true);
  });

  const openForm = () => {
    render(<AddArtistForm />);
    fireEvent.click(screen.getByRole("button", { name: /add another artist/i }));
  };

  it("adds by Spotify typeahead, not a free-text name field", () => {
    openForm();

    // The free-text input produced artists with no Spotify id, so no catalog and
    // no valuation could follow — the whole payoff was unreachable for anyone
    // who arrived without a funnel valuation (chat#1889).
    expect(screen.queryByLabelText(/^artist name$/i)).toBeNull();
    expect(screen.getByLabelText(/search spotify for an artist/i)).toBeDefined();
  });

  // useAddSpotifyArtist seeds the onboarding catalog by kicking POST
  // /api/valuation for the picked artist when the account has none yet.
  // useAddRosterArtist never did, so an account onboarded here finished setup
  // with no catalog and the valuation reward could only show its fallback
  // (chat#1889 row 8).
  it("adds through the hook that seeds the catalog, passing the whole Spotify result", () => {
    openForm();
    fireEvent.click(screen.getByRole("option", { name: /drake/i }));

    expect(add).toHaveBeenCalledWith(SPOTIFY_RESULT);
  });
});
