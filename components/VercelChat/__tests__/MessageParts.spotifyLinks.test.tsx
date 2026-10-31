// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UIMessage } from "ai";
import type {
  SpotifyArtistSearchResult,
  SpotifyAlbumSearchResult,
  SpotifyTrackSearchResult,
  SpotifyAlbum,
  SpotifyTrack,
} from "@/types/spotify";
import { MessageParts } from "../MessageParts";

const network = vi.fn(() => {
  throw new Error("Spotify rendering must not request the network");
});
beforeEach(() => {
  vi.stubGlobal("fetch", network);
  vi.stubGlobal("XMLHttpRequest", network);
  vi.stubGlobal("WebSocket", network);
});
afterEach(() => {
  try {
    cleanup();
    expect(network).not.toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
    network.mockClear();
  }
});

const artist: SpotifyArtistSearchResult = {
  id: "synthetic-artist",
  name: "Synthetic artist",
  type: "artist",
  uri: "spotify:artist:synthetic",
  external_urls: { spotify: "https://open.spotify.com/artist/synthetic" },
  images: [],
  popularity: 0,
  genres: ["Ambient"],
  followers: { href: null, total: 0 },
};
const album: SpotifyAlbumSearchResult = {
  id: "synthetic-album",
  name: "Synthetic album",
  type: "album",
  uri: "spotify:album:synthetic",
  external_urls: { spotify: "https://open.spotify.com/album/synthetic" },
  images: [],
  artists: [artist],
  release_date: "2026-10-01",
};
const track: SpotifyTrackSearchResult = {
  id: "synthetic-track",
  name: "Synthetic track",
  type: "track",
  uri: "spotify:track:synthetic",
  external_urls: { spotify: "https://open.spotify.com/track/synthetic" },
  album,
  artists: [artist],
  duration_ms: 60000,
  explicit: false,
  popularity: 0,
};
const routes = [
  {
    tool: "get_spotify_search",
    title: artist.name,
    subtitle: "Ambient",
    fixture: artist,
  },
  {
    tool: "get_spotify_artist_albums",
    title: album.name,
    subtitle: "2026",
    fixture: album,
  },
  {
    tool: "get_spotify_artist_top_tracks",
    title: track.name,
    subtitle: artist.name,
    fixture: track,
  },
] as const;

function renderResult(
  route: (typeof routes)[number],
  url: unknown,
  cover = false,
) {
  const content = {
    ...route.fixture,
    external_urls: { spotify: url },
    ...(cover
      ? { images: [{ url: "/synthetic-cover.png", width: 100, height: 100 }] }
      : {}),
  };
  const results = {
    get_spotify_search: { artists: { items: [content], total: 1 } },
    get_spotify_artist_albums: { items: [content], total: 2 },
    get_spotify_artist_top_tracks: { tracks: [content] },
  };
  return renderSpotifyResult(results[route.tool], route.tool);
}

function renderSpotifyResult(
  result: unknown,
  toolName: string,
  mode: "MCP" | "SDK" = "MCP",
) {
  const message = {
    id: "spotify-card-boundary",
    role: "assistant",
    parts: [
      { type: "text", text: "Here is the supplied Spotify result." },
      {
        type: mode === "MCP" ? "dynamic-tool" : `tool-${toolName}`,
        ...(mode === "MCP" ? { toolName } : {}),
        toolCallId: "spotify-call",
        state: "output-available",
        input: {},
        output:
          mode === "MCP"
            ? { content: [{ type: "text", text: JSON.stringify(result) }] }
            : result,
      },
      { type: "text", text: "The conversation stays here." },
    ],
  } as unknown as UIMessage;
  return render(
    <MessageParts
      message={message}
      mode="view"
      setMode={() => {}}
      status="ready"
      reload={() => {}}
    />,
  );
}

describe.each(["MCP", "SDK"] as const)(
  "%s artist-album composition",
  (mode) => {
    it.each([
      [
        "Failed to fetch Spotify artist albums",
        "Failed to fetch Spotify artist albums",
      ],
      ["", "Could not retrieve Spotify albums."],
      ["   ", "Could not retrieve Spotify albums."],
      [
        "\n <script>synthetic()</script>\n",
        "\n <script>synthetic()</script>\n",
      ],
    ])("preserves a producer-declared failure (%j)", (message, expected) => {
      const { container } = renderSpotifyResult(
        { success: false, message },
        "get_spotify_artist_albums",
        mode,
      );
      expect(
        screen.getByText("Here is the supplied Spotify result."),
      ).toBeTruthy();
      expect(screen.getByText("The conversation stays here.")).toBeTruthy();
      expect(screen.queryByText("No albums returned from Spotify.")).toBeNull();
      expect(screen.queryByText("Artist Albums")).toBeNull();
      fireEvent.click(
        screen.getByRole("button", {
          name: /Tool failed.*Spotify artist albums/,
        }),
      );
      expect(
        screen.getByRole("region", { name: "Tool response text" }).textContent,
      ).toBe(expected);
      expect(container.querySelector("script")).toBeNull();
    });

    it.each([
      { items: [], total: 12, offset: 4 },
      { items: null, total: 12, offset: 4 },
      { total: 12, offset: 4 },
    ])(
      "keeps an empty artist-album page quiet within the answer (%j)",
      (result) => {
        const { container } = renderSpotifyResult(
          result,
          "get_spotify_artist_albums",
          mode,
        );
        expect(
          screen.getByText("Here is the supplied Spotify result."),
        ).toBeTruthy();
        expect(screen.getByText("The conversation stays here.")).toBeTruthy();
        expect(
          screen.getByText("No albums returned from Spotify.").tagName,
        ).toBe("P");
        expect(
          screen.getAllByRole("button", { name: "Copy response" }),
        ).toHaveLength(2);
        expect(screen.queryByRole("link")).toBeNull();
        expect(screen.queryByText("Artist Albums")).toBeNull();
        expect(screen.queryByText(/Showing/)).toBeNull();
        expect(container.querySelector("img")).toBeNull();
      },
    );

    it("preserves the populated page alongside prose", () => {
      const result = {
        items: [
          album,
          {
            ...album,
            id: "second-release",
            name: "Second supplied release",
            release_date: "",
            artists: [{ ...artist, name: "Supplied artist" }],
            external_urls: { spotify: "javascript:synthetic()" },
          },
        ],
        total: 12,
        offset: 4,
      };
      const original = JSON.stringify(result);
      renderSpotifyResult(result, "get_spotify_artist_albums", mode);
      expect(
        screen.getByText("Here is the supplied Spotify result."),
      ).toBeTruthy();
      expect(screen.getByText("The conversation stays here.")).toBeTruthy();
      expect(
        screen.getAllByRole("heading", { level: 4 }).map((h) => h.textContent),
      ).toEqual(["Synthetic album", "Second supplied release"]);
      expect(screen.getByText("2026")).toBeTruthy();
      expect(screen.getByText("Supplied artist")).toBeTruthy();
      expect(screen.getByText("Showing 2 of 12 albums")).toBeTruthy();
      expect(screen.getAllByRole("link")).toHaveLength(1);
      expect(
        screen
          .getByRole("link", { name: /Synthetic album/ })
          .getAttribute("href"),
      ).toBe(album.external_urls.spotify);
      expect(JSON.stringify(result)).toBe(original);
      expect(screen.queryByText("No albums returned from Spotify.")).toBeNull();
    });
  },
);

const unusableSpotifyUrls = [
  "http://open.spotify.com/artist/synthetic",
  "https://open.spotify.com.evil.test/artist/synthetic",
  "https://open.spotify.com@evil.test/artist/synthetic",
  "javascript:void(0)",
  "data:text/html,synthetic",
  "//open.spotify.com/artist/synthetic",
  "/artist/synthetic",
  "not a URL",
  "#",
  "",
  null,
  undefined,
  42,
  {},
];

describe.each(routes)("Spotify links through $tool", (route) => {
  it.each(unusableSpotifyUrls)(
    "keeps unusable destination %j static without losing content or prose",
    (url) => {
      const { container } = renderResult(route, url);
      expect(screen.queryByRole("link")).toBeNull();
      expect(screen.getByRole("heading", { name: route.title })).toBeTruthy();
      expect(screen.getByText(route.subtitle)).toBeTruthy();
      expect(screen.getByText("No Image")).toBeTruthy();
      expect(
        screen.getByText("Here is the supplied Spotify result."),
      ).toBeTruthy();
      expect(screen.getByText("The conversation stays here.")).toBeTruthy();
      expect(container.querySelector(".lucide-external-link")).toBeNull();
      expect(
        container.querySelector(
          '[class*="hover:bg-black"], [class*="group-hover:scale"]',
        ),
      ).toBeNull();
    },
  );

  it("preserves the destination, new-tab protection and keyboard focus treatment", () => {
    const url =
      "https://open.spotify.com/artist/synthetic?si=synthetic%2Bvalue";
    renderResult(route, url);
    const link = screen.getByRole("link", { name: new RegExp(route.title) });
    expect(link.getAttribute("href")).toBe(url);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")?.split(" ")).toEqual(
      expect.arrayContaining(["noopener", "noreferrer"]),
    );
    expect(link.className).toContain("focus-visible:ring-ring");
    expect(link.className).toContain("focus-visible:ring-2");
    expect(link.querySelector("button, a, input, [tabindex]")).toBeNull();
    expect(screen.getByText(route.subtitle)).toBeTruthy();
    expect(screen.getByText("The conversation stays here.")).toBeTruthy();
    if (route.tool === "get_spotify_artist_albums")
      expect(screen.getByText("Showing 1 of 2 albums")).toBeTruthy();
  });
});

it.each(routes)(
  "canonicalizes an ambiguous URL before rendering through $tool",
  (route) => {
    renderResult(route, "https:open.spotify.com/artist/synthetic?si=a%2Bb");
    const link = screen.getByRole("link", { name: new RegExp(route.title) });
    const expected = "https://open.spotify.com/artist/synthetic?si=a%2Bb";
    expect(link.getAttribute("href")).toBe(expected);
    expect(
      new URL(link.getAttribute("href")!, "https://app.recoupable.dev/chat")
        .href,
    ).toBe(expected);
  },
);

it("retains supplied cover and title when search has no usable link", () => {
  renderResult(
    routes[0],
    "https://elsewhere.example.test/artist/synthetic",
    true,
  );
  const image = screen.getByRole("img", { name: artist.name });
  expect(image.getAttribute("src")).toBe("/synthetic-cover.png");
  expect(screen.queryByRole("link")).toBeNull();
  expect(screen.getByText("Ambient")).toBeTruthy();
});

const detailArtist = {
  ...artist,
  href: "https://api.spotify.com/v1/artists/synthetic",
};
const detailTrack: SpotifyTrack = {
  ...track,
  artists: [detailArtist],
  available_markets: [],
  disc_number: 1,
  href: "https://api.spotify.com/v1/tracks/synthetic",
  is_playable: true,
  track_number: 1,
  is_local: false,
  preview_url: null,
  explicit: true,
};
const albumDetail: SpotifyAlbum = {
  ...album,
  artists: [detailArtist],
  album_type: "album",
  total_tracks: 2,
  available_markets: [],
  href: "https://api.spotify.com/v1/albums/synthetic",
  release_date: "2026-10-01",
  release_date_precision: "day",
  tracks: {
    href: "https://api.spotify.com/v1/albums/synthetic/tracks",
    limit: 2,
    next: null,
    previous: null,
    total: 2,
    offset: 0,
    items: [
      detailTrack,
      {
        ...detailTrack,
        id: "second-track",
        name: "Second track",
        track_number: 2,
        duration_ms: 90000,
        explicit: false,
      },
    ],
  },
  copyrights: [],
  external_ids: {},
  genres: ["Ambient"],
  label: "Synthetic Label",
  popularity: 0,
};

function renderAlbum(albumUrl: unknown, trackUrl: unknown) {
  return renderSpotifyResult(
    {
      ...albumDetail,
      external_urls: { spotify: albumUrl },
      tracks: {
        ...albumDetail.tracks,
        items: [
          { ...detailTrack, external_urls: { spotify: trackUrl } },
          albumDetail.tracks.items[1],
        ],
      },
    },
    "get_spotify_album",
  );
}

describe("Album detail navigation through get_spotify_album", () => {
  it.each(unusableSpotifyUrls)(
    "keeps unusable album destination %j static with valid tracks and prose",
    (url) => {
      renderAlbum(url, detailTrack.external_urls.spotify);
      expect(screen.queryByRole("link", { name: /Listen/ })).toBeNull();
      expect(
        screen.getByRole("heading", { name: albumDetail.name }),
      ).toBeTruthy();
      expect(screen.getByText(detailTrack.name).closest("a")).toBeTruthy();
      expect(screen.getByText("Second track").closest("a")).toBeTruthy();
      expect(screen.getByText("2 songs")).toBeTruthy();
      expect(screen.getByText("2:30")).toBeTruthy();
      expect(screen.getByText("2026")).toBeTruthy();
      expect(screen.getByText("Synthetic Label")).toBeTruthy();
      expect(screen.getByText("Ambient")).toBeTruthy();
      expect(
        screen.getByText("Here is the supplied Spotify result."),
      ).toBeTruthy();
      expect(screen.getByText("The conversation stays here.")).toBeTruthy();
    },
  );

  it.each(unusableSpotifyUrls)(
    "keeps unusable track destination %j static with its metadata and valid siblings",
    (url) => {
      renderAlbum(albumDetail.external_urls.spotify, url);
      const title = screen.getByText(detailTrack.name);
      expect(title.closest("a")).toBeNull();
      const row = screen.getByRole("group", { name: detailTrack.name });
      expect(
        row.querySelector(".lucide-play, .lucide-external-link"),
      ).toBeNull();
      expect(row.className).not.toContain("hover:");
      expect(screen.getByText("1")).toBeTruthy();
      expect(screen.getByText("E")).toBeTruthy();
      expect(screen.getByText("1:00")).toBeTruthy();
      expect(screen.getAllByText(artist.name).length).toBe(3);
      expect(screen.getByText("Second track").closest("a")).toBeTruthy();
      expect(screen.getByRole("link", { name: /Listen/ })).toBeTruthy();
      expect(screen.getByText("The conversation stays here.")).toBeTruthy();
    },
  );

  it("keeps the explicit marker visible on small screens", () => {
    renderAlbum(albumDetail.external_urls.spotify, "");
    const marker = screen.getByText("E");
    expect(marker.classList.contains("hidden")).toBe(false);
    expect(marker.classList.contains("inline-flex")).toBe(true);
  });

  it("renders canonical album and track destinations with focus and new-tab protection", () => {
    const { container } = renderAlbum(
      "HTTPS://OPEN.SPOTIFY.COM/album/synthetic?si=x%2By",
      "https:open.spotify.com/track/synthetic?si=a%2Bb",
    );
    const albumLink = screen.getByRole("link", { name: /Listen/ });
    const trackLink = screen.getByText(detailTrack.name).closest("a")!;
    expect(albumLink.getAttribute("href")).toBe(
      "https://open.spotify.com/album/synthetic?si=x%2By",
    );
    expect(trackLink.getAttribute("href")).toBe(
      "https://open.spotify.com/track/synthetic?si=a%2Bb",
    );
    for (const link of [albumLink, trackLink]) {
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")?.split(" ")).toEqual(
        expect.arrayContaining(["noopener", "noreferrer"]),
      );
      expect(link.className).toContain("focus-visible:ring-ring");
      expect(link.querySelector("button, a, input, [tabindex]")).toBeNull();
    }
    expect(albumLink.className).toContain("min-h-11");
    expect(container.querySelector("a a")).toBeNull();
    expect(screen.getByText("1:30")).toBeTruthy();
    expect(screen.getByText("2:30")).toBeTruthy();
  });

  it("preserves a track without an external_urls object as static content", () => {
    renderSpotifyResult(
      {
        ...albumDetail,
        tracks: {
          ...albumDetail.tracks,
          items: [
            { ...detailTrack, external_urls: undefined },
            albumDetail.tracks.items[1],
          ],
        },
      },
      "get_spotify_album",
    );
    expect(screen.getByText(detailTrack.name).closest("a")).toBeNull();
    expect(screen.getByText("Second track").closest("a")).toBeTruthy();
    expect(screen.getByText("The conversation stays here.")).toBeTruthy();
  });
});
