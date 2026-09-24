// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SongsSection from "../SongsSection";

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
afterEach(cleanup);
describe("SongsSection", () => {
  it("shows one artist list without catalog labels and expands 64 unique songs", () => {
    render(<SongsSection songs={songs} artistId="artist" socials={[]} />);
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
  it("renders the artist song order returned by the API", () => {
    render(
      <SongsSection
        songs={[songs[10], songs[0]]}
        artistId="artist"
        socials={[]}
      />,
    );
    expect(
      screen.getAllByText(/^ISRC/).map((node) => node.textContent),
    ).toEqual(["ISRC10", "ISRC0"]);
    expect(screen.queryByRole("button")).toBeNull();
  });
  it("keeps the existing empty state when the artist has no song rows", () => {
    render(<SongsSection songs={[]} artistId="artist" socials={[]} />);
    expect(screen.getByText("No recordings")).toBeDefined();
  });
});
