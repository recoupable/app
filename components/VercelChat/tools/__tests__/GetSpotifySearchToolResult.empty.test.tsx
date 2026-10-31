// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UIMessage } from "ai";
import type {
  SpotifyArtistSearchResult,
  SpotifySearchResponse,
} from "@/types/spotify";
import { MessageParts } from "@/components/VercelChat/MessageParts";
import GetSpotifySearchToolResult from "../GetSpotifySearchToolResult";

const network = vi.fn(() => {
  throw new Error("Search rendering must not request the network");
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

const emptyCases: [string, SpotifySearchResponse][] = [
  ["omitted categories", {}],
  [
    "all empty categories",
    Object.fromEntries(
      [
        "artists",
        "albums",
        "tracks",
        "playlists",
        "shows",
        "episodes",
        "audiobooks",
      ].map((key) => [key, { items: [], total: 0 }]),
    ),
  ],
  [
    "an empty page with a positive total",
    { artists: { items: [], total: 12 } },
  ],
  ["metadata only", { success: true, query: "Synthetic search", total: 12 }],
];
const artist: SpotifyArtistSearchResult = {
  id: "synthetic-artist",
  name: "Synthetic artist",
  type: "artist",
  uri: "spotify:artist:synthetic",
  external_urls: {
    spotify: "https://open.spotify.com/artist/synthetic?si=a%2Bb",
  },
  images: [],
  popularity: 0,
  genres: ["Ambient"],
  followers: { href: null, total: 0 },
};

function renderChatResult(
  result: SpotifySearchResponse,
  type: "dynamic-tool" | "tool-get_spotify_search" = "dynamic-tool",
  isError = false,
) {
  const reload = vi.fn();
  const message = {
    id: "synthetic-search",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "I searched the supplied Spotify query.",
        state: "done",
      },
      {
        type,
        toolName: "get_spotify_search",
        toolCallId: "synthetic-search",
        state: "output-available",
        input: {},
        output:
          type === "dynamic-tool"
            ? {
                isError,
                content: [{ type: "text", text: JSON.stringify(result) }],
              }
            : result,
      },
      {
        type: "dynamic-tool",
        toolName: "get_chats",
        toolCallId: "synthetic-chats",
        state: "output-available",
        input: {},
        output: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                chats: [
                  {
                    id: "synthetic-chat",
                    title: "Synthetic saved chat",
                    accountId: "synthetic-account",
                    sessionId: "synthetic-session",
                    updatedAt: "2026-10-01T00:00:00Z",
                  },
                ],
              }),
            },
          ],
        },
      },
      { type: "text", text: "The conversation continues.", state: "done" },
    ],
  } as unknown as UIMessage;
  return {
    ...render(
      <MessageParts
        message={message}
        mode="view"
        setMode={() => {}}
        status="ready"
        reload={reload}
      />,
    ),
    reload,
  };
}

describe("Spotify searches with no returned results", () => {
  it.each(emptyCases)(
    "explains %s without adding a card or action",
    (_label, result) => {
      const { container } = render(
        <GetSpotifySearchToolResult result={result} />,
      );
      expect(
        screen.getByText("No Spotify search results returned.").tagName,
      ).toBe("P");
      expect(screen.queryByRole("heading")).toBeNull();
      expect(screen.queryByRole("link")).toBeNull();
      expect(screen.queryByRole("button")).toBeNull();
      expect(
        container.querySelector("svg, [role='status'], [aria-live]"),
      ).toBeNull();
      expect(container.textContent).toBe("No Spotify search results returned.");
    },
  );
  describe.each(["dynamic-tool", "tool-get_spotify_search"] as const)(
    "%s chat output",
    (type) => {
      it.each(emptyCases)(
        "keeps %s alongside prose and a typed result",
        (_label, result) => {
          const { reload } = renderChatResult(result, type);
          expect(
            screen.getByText("No Spotify search results returned."),
          ).toBeTruthy();
          expect(
            screen.getByText("I searched the supplied Spotify query."),
          ).toBeTruthy();
          expect(screen.getByText("The conversation continues.")).toBeTruthy();
          expect(
            screen
              .getByRole("link", { name: "Synthetic saved chat" })
              .getAttribute("href"),
          ).toBe("/sessions/synthetic-session/chats/synthetic-chat");
          expect(reload).not.toHaveBeenCalled();
        },
      );
    },
  );
  it("preserves populated category order, cards and destinations while ignoring empty sections", () => {
    render(
      <GetSpotifySearchToolResult
        result={{
          success: true,
          tracks: { items: [], total: 0 },
          artists: { items: [artist], total: 12 },
          albums: {
            items: [
              {
                id: "synthetic-album",
                name: "Synthetic album",
                type: "album",
                uri: "spotify:album:synthetic",
                images: [],
                artists: [artist],
                external_urls: {
                  spotify: "https://open.spotify.com/album/synthetic",
                },
                release_date: "2026-10-01",
              },
            ],
            total: 1,
          },
        }}
      />,
    );
    expect(
      screen.queryByText("No Spotify search results returned."),
    ).toBeNull();
    expect(screen.queryByText("Tracks")).toBeNull();
    expect(
      screen
        .getByText("Artists")
        .compareDocumentPosition(screen.getByText("Albums")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText("Ambient")).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Synthetic album" }),
    ).toBeTruthy();
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      artist.external_urls.spotify,
      "https://open.spotify.com/album/synthetic",
    ]);
    for (const link of links) {
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });
  it("keeps explicit MCP failures in the existing failure disclosure", () => {
    const { reload } = renderChatResult({}, "dynamic-tool", true);
    expect(screen.getByRole("button", { name: /Tool failed/ })).toBeTruthy();
    expect(
      screen.queryByText("No Spotify search results returned."),
    ).toBeNull();
    expect(
      screen.getByText("I searched the supplied Spotify query."),
    ).toBeTruthy();
    expect(screen.getByText("The conversation continues.")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Synthetic saved chat" }),
    ).toBeTruthy();
    expect(reload).not.toHaveBeenCalled();
  });
});
