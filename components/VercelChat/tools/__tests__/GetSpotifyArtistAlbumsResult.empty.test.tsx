// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DynamicToolUIPart, ToolUIPart } from "ai";
import type { SpotifyArtistAlbumsResultUIType } from "@/types/spotify";
import { getToolResultComponent } from "../../ToolComponents";
import GetSpotifyArtistAlbumsResult from "../GetSpotifyArtistAlbumsResult";

const network = vi.fn(() => {
  throw new Error("Artist-album rendering must not request the network");
});
beforeEach(() => {
  vi.stubGlobal("fetch", network);
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

const page: SpotifyArtistAlbumsResultUIType = {
  status: "success",
  href: "https://api.spotify.com/v1/artists/fixture/albums",
  next: "",
  previous: "",
  items: [],
  limit: 20,
  total: 12,
  offset: 4,
};

function renderAlbums(mode: "standalone" | "SDK", result: unknown) {
  return render(
    mode === "standalone" ? (
      <GetSpotifyArtistAlbumsResult
        result={result as SpotifyArtistAlbumsResultUIType}
      />
    ) : (
      getToolResultComponent({
        type: "tool-get_spotify_artist_albums",
        toolCallId: "artist-albums-fixture",
        state: "output-available",
        input: {},
        output: result,
      } as ToolUIPart)
    ),
  );
}

describe.each(["standalone", "SDK"] as const)(
  "%s artist-album empty results",
  (mode) => {
    it.each([
      ["empty items", { ...page }],
      ["null items", { ...page, items: null }],
      ["omitted items", { ...page, items: undefined }],
    ])(
      "uses one quiet sentence for %s despite a positive total",
      (_, result) => {
        const { container } = renderAlbums(mode, result);
        const paragraph = screen.getByText("No albums returned from Spotify.");
        expect(paragraph.tagName).toBe("P");
        expect(paragraph.className).toContain("text-muted-foreground");
        expect(container.textContent).toBe(paragraph.textContent);
        expect(container.querySelectorAll("p")).toHaveLength(1);
        expect(
          container.querySelector(
            "img, svg, a, button, [tabindex], [aria-live]",
          ),
        ).toBeNull();
        expect(screen.queryByText("Artist Albums")).toBeNull();
        expect(screen.queryByText(/Showing/)).toBeNull();
        expect(
          screen.queryByText("No albums found for this artist."),
        ).toBeNull();
      },
    );

    it("preserves populated release order, year/fallback, pagination and guarded destinations", () => {
      const result = {
        ...page,
        items: [
          {
            id: "release-one",
            name: "First supplied release",
            type: "album",
            uri: "spotify:album:release-one",
            images: [],
            artists: [{ name: "First artist" }],
            release_date: "2026-10-01",
            external_urls: {
              spotify:
                "https://open.spotify.com/album/release-one?si=fixture%2Bvalue#tracks",
            },
          },
          {
            id: "release-two",
            name: "<svg onload=synthetic()>",
            type: "album",
            uri: "spotify:album:release-two",
            images: [],
            artists: [{ name: "Second artist" }],
            release_date: "",
            external_urls: { spotify: "javascript:void(0)" },
          },
        ],
      };
      const original = JSON.stringify(result);
      const { container } = renderAlbums(mode, result);
      expect(screen.getByText("Artist Albums")).toBeTruthy();
      expect(screen.getByRole("img", { name: "Spotify" })).toBeTruthy();
      expect(
        screen
          .getAllByRole("heading", { level: 4 })
          .map((node) => node.textContent),
      ).toEqual(["First supplied release", "<svg onload=synthetic()>"]);
      expect(screen.getByText("2026")).toBeTruthy();
      expect(screen.getByText("Second artist")).toBeTruthy();
      expect(screen.getByText("Showing 2 of 12 albums")).toBeTruthy();
      expect(screen.getAllByText("No Image")).toHaveLength(2);
      const link = screen.getByRole("link", { name: /First supplied release/ });
      expect(link.getAttribute("href")).toBe(
        result.items[0].external_urls.spotify,
      );
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
      expect(screen.getAllByRole("link")).toHaveLength(1);
      expect(
        screen.getByText("<svg onload=synthetic()>").closest("a"),
      ).toBeNull();
      expect(container.querySelector("[onload]")).toBeNull();
      expect(screen.queryByText("No albums returned from Spotify.")).toBeNull();
      expect(JSON.stringify(result)).toBe(original);
    });
  },
);

it.each([false, true])(
  "preserves explicit failure disclosure before the typed renderer (MCP=%s)",
  (dynamic) => {
    const details = "Synthetic artist-album lookup failed";
    const part = dynamic
      ? {
          type: "dynamic-tool",
          toolName: "get_spotify_artist_albums",
          toolCallId: "failed-artist-albums",
          state: "output-available",
          input: {},
          output: { isError: true, content: [{ type: "text", text: details }] },
        }
      : {
          type: "tool-get_spotify_artist_albums",
          toolCallId: "failed-artist-albums",
          state: "output-error",
          input: {},
          errorText: details,
        };
    render(getToolResultComponent(part as ToolUIPart | DynamicToolUIPart));
    expect(screen.queryByText("No albums returned from Spotify.")).toBeNull();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText(details)).toBeTruthy();
  },
);
