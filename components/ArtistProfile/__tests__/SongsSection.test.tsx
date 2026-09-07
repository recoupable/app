// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SongsSection from "../SongsSection";
import type { ArtistProfileCatalog } from "@/lib/recoup/getArtistProfile";

vi.mock("../EmptySongsState", () => ({
  default: () => <div>No recordings</div>,
}));
const songs = Array.from({ length: 64 }, (_, i) => ({
  isrc: `ISRC${i}`,
  name: i === 63 ? "Better Than That" : `Recording ${i}`,
  album: "Release",
  artwork_url: null,
  plays: 6400 - i,
  est_value_usd: 0,
}));
const catalogs: ArtistProfileCatalog[] = [
  {
    id: "park",
    name: "The Park",
    song_count: 64,
    updated_at: "2026-09-07",
    songs,
  },
  {
    id: "heno",
    name: "Heno.",
    song_count: 105,
    updated_at: "2026-08-01",
    songs: [songs[63]],
  },
];
afterEach(cleanup);
describe("SongsSection", () => {
  it("shows one artist list without catalog labels and expands 64 unique songs", () => {
    render(<SongsSection catalogs={catalogs} artistId="artist" socials={[]} />);
    expect(screen.getAllByRole("heading", { name: "Songs" })).toHaveLength(1);
    expect(screen.queryByText(/Heno\./)).toBeNull();
    expect(screen.queryByText(/Updated/)).toBeNull();
    expect(screen.getByText("64 songs")).toBeDefined();
    expect(screen.queryByText("Better Than That")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Show all 64 songs" }));
    expect(screen.getAllByText(/^ISRC/)).toHaveLength(64);
    expect(screen.getAllByText("Better Than That")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Show fewer songs" }));
    expect(screen.getAllByText(/^ISRC/)).toHaveLength(5);
  });
  it("globally sorts songs from multiple catalogs by plays", () => {
    render(
      <SongsSection
        catalogs={[
          { ...catalogs[0], songs: [songs[10]], song_count: 1 },
          { ...catalogs[1], songs: [songs[0]], song_count: 1 },
        ]}
        artistId="artist"
        socials={[]}
      />,
    );
    expect(
      screen.getAllByText(/^ISRC/).map((node) => node.textContent),
    ).toEqual(["ISRC0", "ISRC10"]);
    expect(screen.queryByRole("button")).toBeNull();
  });
  it("keeps the existing empty state when no catalog has song rows", () => {
    render(
      <SongsSection
        catalogs={[{ ...catalogs[0], songs: [] }]}
        artistId="artist"
        socials={[]}
      />,
    );
    expect(screen.getByText("No recordings")).toBeDefined();
  });
});
