// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import CatalogSongsResult from "../CatalogSongsResult";
import type { CatalogSong } from "@/lib/catalog/getCatalogSongs";

vi.mock("@/hooks/useCatalogSongsFileSelect", () => ({
  useCatalogSongsFileSelect: () => ({
    isUploading: false,
    uploadResult: null,
    uploadError: null,
    uploadProgress: { total: 0, current: 0 },
    handleFileSelect: vi.fn(),
  }),
}));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const songs: CatalogSong[] = Array.from({ length: 10_000 }, (_, index) => ({
  catalog_id: "synthetic-catalog",
  isrc: `SYNTH${index}`,
  name: `Song ${index}`,
  album: "Synthetic album",
  notes: index % 2 ? null : "Supplied note",
  artwork_url: null,
  updated_at: "2026-10-25T00:00:00Z",
  artists: [{ id: "synthetic-artist", name: "Synthetic artist", timestamp: 0 }],
}));

it("bounds 10,000 returned rows, filters before paging, and preserves source values without requests", () => {
  const network = vi.fn();
  vi.stubGlobal("fetch", network);
  const before = JSON.stringify(songs);
  const { container } = render(
    <CatalogSongsResult result={{ success: true, songs }} />,
  );
  expect(container.querySelectorAll("tbody tr")).toHaveLength(50);
  expect(screen.getByText("Song 0")).toBeTruthy();
  expect(screen.queryByText("Song 50")).toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: "Last page of returned songs" }),
  );
  expect(screen.getByText("Song 9999")).toBeTruthy();
  expect(container.querySelectorAll("tbody tr")).toHaveLength(50);
  const toggle = screen.getByRole("switch");
  toggle.focus();
  fireEvent.click(toggle);
  expect(screen.getByText("Song 0")).toBeTruthy();
  expect(screen.queryByText("Song 1")).toBeNull();
  expect(document.activeElement).toBe(toggle);
  expect(
    screen.getByText(
      "Showing 1–50 of 5000 matching songs (10000 returned; 5000 hidden)",
    ),
  ).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: "Last page of returned songs" }),
  );
  expect(screen.getByText("Song 9998")).toBeTruthy();
  expect(screen.queryByText("Song 9999")).toBeNull();
  expect(container.querySelectorAll("tbody tr")).toHaveLength(50);
  expect(JSON.stringify(songs)).toBe(before);
  expect(network).not.toHaveBeenCalled();
});

it("keeps a loaded page when more rows arrive and clamps after a shorter replacement", () => {
  const { rerender, container } = render(
    <CatalogSongsResult
      result={{ success: true, songs: songs.slice(0, 100) }}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Next page of returned songs" }),
  );
  rerender(
    <CatalogSongsResult
      result={{ success: true, songs: songs.slice(0, 150) }}
    />,
  );
  expect(screen.getByText("Song 50")).toBeTruthy();
  expect(screen.queryByText("Song 0")).toBeNull();
  rerender(
    <CatalogSongsResult
      result={{ success: true, songs: songs.slice(0, 20) }}
    />,
  );
  expect(screen.getByText("Song 0")).toBeTruthy();
  expect(container.querySelectorAll("tbody tr")).toHaveLength(20);
  expect(
    screen.queryByRole("navigation", { name: "Returned songs pages" }),
  ).toBeNull();
  rerender(
    <CatalogSongsResult
      result={{ success: true, songs: songs.slice(0, 150) }}
    />,
  );
  expect(screen.getByText("Song 0")).toBeTruthy();
});
