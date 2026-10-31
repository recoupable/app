// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SpotifyAlbum, SpotifyTrack } from "@/types/spotify";
import { renderSpotifyChatResult } from "./renderSpotifyChatResult";
import GetSpotifyAlbumWithTracksResult from "../GetSpotifyAlbumWithTracksResult";

const network = vi.fn(() => {
  throw new Error("Album rendering must not request the network");
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

const artist = {
  id: "synthetic-artist",
  name: "Synthetic artist",
  type: "artist",
  uri: "spotify:artist:synthetic",
  href: "https://api.spotify.com/v1/artists/synthetic",
  external_urls: { spotify: "https://open.spotify.com/artist/synthetic" },
};
const track: SpotifyTrack = {
  id: "synthetic-track-one",
  name: "First supplied track",
  type: "track",
  uri: "spotify:track:synthetic",
  external_urls: {
    spotify: "https://open.spotify.com/track/synthetic?si=a%2Bb#supplied",
  },
  artists: [artist],
  available_markets: [],
  disc_number: 1,
  duration_ms: 150000,
  explicit: true,
  href: "https://api.spotify.com/v1/tracks/synthetic",
  is_playable: true,
  preview_url: null,
  track_number: 1,
  is_local: false,
};
const album: SpotifyAlbum = {
  id: "synthetic-album",
  name: "Synthetic album",
  type: "album",
  uri: "spotify:album:synthetic",
  external_urls: {
    spotify: "https://open.spotify.com/album/synthetic?si=a%2Bb#supplied",
  },
  images: [],
  artists: [artist],
  album_type: "album",
  total_tracks: 12,
  available_markets: [],
  href: "https://api.spotify.com/v1/albums/synthetic",
  release_date: "2026-10-01",
  release_date_precision: "day",
  tracks: {
    href: "https://api.spotify.com/v1/albums/synthetic/tracks",
    limit: 2,
    next: null,
    previous: null,
    total: 12,
    offset: 0,
    items: [
      track,
      {
        ...track,
        id: "synthetic-track-two",
        name: "Second supplied track",
        duration_ms: 210000,
        track_number: 2,
        explicit: false,
        external_urls: { spotify: "javascript:synthetic()" },
      },
    ],
  },
  copyrights: [],
  external_ids: {},
  genres: ["Ambient"],
  label: "Synthetic Label",
  popularity: 0,
};
const emptyAlbum = { ...album, tracks: { ...album.tracks, items: [] } };
const emptyCases: [string, unknown][] = [
  ["an empty track page with a positive album total", emptyAlbum],
  ["null items", { ...album, tracks: { ...album.tracks, items: null } }],
  [
    "omitted items",
    {
      ...album,
      tracks: Object.fromEntries(
        Object.entries(album.tracks).filter(([key]) => key !== "items"),
      ),
    },
  ],
  ["a null track page", { ...album, tracks: null }],
  [
    "an omitted track page",
    Object.fromEntries(
      Object.entries(album).filter(([key]) => key !== "tracks"),
    ),
  ],
];

const chatContext = {
  toolName: "get_spotify_album" as const,
  intro: "Here is the supplied album.",
};

describe("Spotify albums with no returned tracks", () => {
  it.each(emptyCases)(
    "explains %s without an album card or action",
    (_label, result) => {
      const { container } = render(
        <GetSpotifyAlbumWithTracksResult result={result as SpotifyAlbum} />,
      );
      expect(
        screen.getByText("No tracks returned for Synthetic album.").tagName,
      ).toBe("P");
      expect(container.textContent).toBe(
        "No tracks returned for Synthetic album.",
      );
      expect(container.children.length).toBe(1);
      expect(
        container.querySelector(
          "h1,h2,h3,h4,svg,a,button,[role='status'],[aria-live]",
        ),
      ).toBeNull();
    },
  );

  it.each(["", "LongAlbumTitle".repeat(24), "<svg onload=synthetic()>"])(
    "preserves a supplied name as literal text or uses the fallback: %s",
    (name) => {
      const { container } = render(
        <GetSpotifyAlbumWithTracksResult result={{ ...emptyAlbum, name }} />,
      );
      expect(container.textContent).toBe(
        `No tracks returned for ${name || "this Spotify album"}.`,
      );
      expect(container.firstElementChild?.tagName).toBe("P");
      expect(container.querySelector("svg,img,a,button")).toBeNull();
    },
  );

  describe.each([true, false])("chat output with dynamic=%s", (dynamic) => {
    it.each([
      [
        "Failed to generate Spotify access token",
        "Failed to generate Spotify access token",
      ],
      ["", "Could not retrieve this Spotify album."],
      [" \t\n ", "Could not retrieve this Spotify album."],
      [
        "<script>literal provider failure</script>",
        "<script>literal provider failure</script>",
      ],
    ])("preserves a declared producer failure: %s", (message, expected) => {
      const reload = renderSpotifyChatResult({
        ...chatContext,
        result: { success: false, message },
        dynamic,
      });
      expect(screen.queryByText(/No tracks returned/)).toBeNull();
      expect(screen.queryByRole("heading", { name: album.name })).toBeNull();
      const error = screen.getByRole("button", { name: /Tool failed/ });
      expect(error.getAttribute("aria-expanded")).toBe("false");
      fireEvent.click(error);
      expect(
        screen.getByRole("region", { name: "Tool response text" }).textContent,
      ).toBe(expected);
      expect(document.querySelector("script")).toBeNull();
      expect(reload).not.toHaveBeenCalled();
    });

    it.each(emptyCases)(
      "keeps %s alongside prose and chat",
      (_label, result) => {
        const reload = renderSpotifyChatResult({
          ...chatContext,
          result,
          dynamic,
        });
        expect(
          screen.getByText("No tracks returned for Synthetic album."),
        ).toBeTruthy();
        expect(screen.queryByRole("link", { name: /Listen/ })).toBeNull();
        expect(screen.queryByRole("heading", { name: album.name })).toBeNull();
        expect(reload).not.toHaveBeenCalled();
      },
    );

    it("preserves populated album metadata, rows and guarded destinations", () => {
      const reload = renderSpotifyChatResult({
        ...chatContext,
        result: album,
        dynamic,
      });
      expect(screen.queryByText(/No tracks returned/)).toBeNull();
      expect(screen.getByRole("heading", { name: album.name })).toBeTruthy();
      expect(screen.getByText("6:00")).toBeTruthy();
      expect(screen.getByText("12 songs")).toBeTruthy();
      expect(screen.getByText("2026")).toBeTruthy();
      expect(screen.getByText("Synthetic Label")).toBeTruthy();
      expect(screen.getByText("Ambient")).toBeTruthy();
      expect(
        screen
          .getAllByRole("group")
          .map((row) => row.getAttribute("aria-label")),
      ).toEqual([track.name, "Second supplied track"]);
      const listen = screen.getByRole("link", { name: /Listen/ });
      const link = screen.getByText(track.name).closest("a");
      expect(listen.getAttribute("href")).toBe(album.external_urls.spotify);
      expect(link?.getAttribute("href")).toBe(track.external_urls.spotify);
      for (const item of [listen, link]) {
        expect(item?.getAttribute("target")).toBe("_blank");
        expect(item?.getAttribute("rel")).toBe("noopener noreferrer");
      }
      expect(screen.getByText("Second supplied track").closest("a")).toBeNull();
      expect(reload).not.toHaveBeenCalled();
    });

    it("keeps an explicit failure in the existing error disclosure", () => {
      const result = { message: "Synthetic provider failure" };
      const reload = renderSpotifyChatResult({
        ...chatContext,
        result,
        dynamic,
        failed: true,
      });
      expect(screen.queryByText(/No tracks returned/)).toBeNull();
      const error = screen.getByRole("button", {
        name: dynamic ? /Tool failed/ : "get_spotify_album",
      });
      expect(error.getAttribute("aria-expanded")).toBe("false");
      fireEvent.click(error);
      expect(
        screen.getByText(dynamic ? JSON.stringify(result) : result.message),
      ).toBeTruthy();
      expect(reload).not.toHaveBeenCalled();
    });
  });
});
