// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  SpotifyArtistSearchResult,
  SpotifyArtistTopTracksResultType,
  SpotifyTrackSearchResult,
} from "@/types/spotify";
import { renderSpotifyChatResult } from "./renderSpotifyChatResult";
import SpotifyArtistTopTracksResult from "../SpotifyArtistTopTracksResult";

const network = vi.fn(() => {
  throw new Error("Top-tracks rendering must not request the network");
});
beforeEach(() => vi.stubGlobal("fetch", network));
afterEach(() => {
  try {
    cleanup();
    expect(network).not.toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
    network.mockClear();
  }
});

const emptyCases: [string, unknown][] = [
  ["empty tracks", { tracks: [] }],
  ["null tracks", { tracks: null }],
  ["omitted tracks", {}],
];
const artist: SpotifyArtistSearchResult = {
  id: "synthetic-artist",
  name: "Synthetic artist",
  type: "artist",
  uri: "spotify:artist:synthetic",
  external_urls: { spotify: "https://open.spotify.com/artist/synthetic" },
  images: [],
  popularity: 0,
  genres: [],
  followers: { href: null, total: 0 },
};
const track: SpotifyTrackSearchResult = {
  id: "synthetic-track-one",
  name: "First supplied track",
  type: "track",
  uri: "spotify:track:synthetic",
  external_urls: {
    spotify: "https://open.spotify.com/track/synthetic?si=a%2Bb#supplied",
  },
  album: {
    id: "synthetic-album",
    name: "Synthetic album",
    type: "album",
    uri: "spotify:album:synthetic",
    external_urls: { spotify: "https://open.spotify.com/album/synthetic" },
    images: [],
    artists: [artist],
  },
  artists: [artist],
  duration_ms: 180000,
  explicit: false,
  popularity: 0,
};
const populated: SpotifyArtistTopTracksResultType = {
  tracks: [
    track,
    {
      ...track,
      id: "synthetic-track-two",
      name: "Second supplied track",
      external_urls: { spotify: "javascript:synthetic()" },
    },
  ],
};

const chatContext = {
  toolName: "get_spotify_artist_top_tracks" as const,
  intro: "Here are the supplied top tracks.",
};

describe("Spotify top tracks with no returned tracks", () => {
  it.each(emptyCases)(
    "explains %s without a card or action",
    (_label, result) => {
      const { container } = render(
        <SpotifyArtistTopTracksResult
          result={result as SpotifyArtistTopTracksResultType}
        />,
      );
      expect(screen.getByText("No Spotify top tracks returned.").tagName).toBe(
        "P",
      );
      expect(container.textContent).toBe("No Spotify top tracks returned.");
      expect(container.children.length).toBe(1);
      expect(
        container.querySelector(
          "h1,h2,h3,h4,svg,a,button,[role='status'],[aria-live]",
        ),
      ).toBeNull();
    },
  );

  describe.each([true, false])("chat output with dynamic=%s", (dynamic) => {
    it.each(emptyCases)(
      "keeps %s alongside prose and chat",
      (_label, result) => {
        const reload = renderSpotifyChatResult({
          ...chatContext,
          result,
          dynamic,
        });
        expect(
          screen.getByText("No Spotify top tracks returned."),
        ).toBeTruthy();
        expect(screen.queryByText(/Failed to get Spotify/)).toBeNull();
        expect(
          screen.queryByRole("heading", { name: "Top Tracks" }),
        ).toBeNull();
        expect(reload).not.toHaveBeenCalled();
      },
    );

    it("preserves populated track order and guarded destinations", () => {
      const reload = renderSpotifyChatResult({
        ...chatContext,
        result: populated,
        dynamic,
      });
      expect(screen.queryByText("No Spotify top tracks returned.")).toBeNull();
      expect(screen.getByRole("heading", { name: "Top Tracks" })).toBeTruthy();
      expect(
        screen.getAllByRole("heading", { level: 4 }).map((h) => h.textContent),
      ).toEqual(["First supplied track", "Second supplied track"]);
      const link = screen.getByRole("link", { name: /First supplied track/ });
      expect(link.getAttribute("href")).toBe(track.external_urls.spotify);
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
      expect(screen.getByText("Second supplied track").closest("a")).toBeNull();
      expect(reload).not.toHaveBeenCalled();
    });

    it("keeps an explicit failure in the existing error disclosure", () => {
      const reload = renderSpotifyChatResult({
        ...chatContext,
        result: { tracks: [] },
        dynamic,
        failed: true,
      });
      expect(screen.queryByText("No Spotify top tracks returned.")).toBeNull();
      const error = screen.getByRole("button", {
        name: dynamic ? /Tool failed/ : "get_spotify_artist_top_tracks",
      });
      expect(error.getAttribute("aria-expanded")).toBe("false");
      fireEvent.click(error);
      expect(
        screen.getByText(
          dynamic ? '{"tracks":[]}' : "Synthetic provider failure",
        ),
      ).toBeTruthy();
      expect(reload).not.toHaveBeenCalled();
    });
  });
});
