// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import CatalogSongsDisplay from "../CatalogSongsDisplay";

const fixture = vi.hoisted(() => ({
  fetchNextPage: vi.fn(),
  query: {} as Record<string, unknown>,
}));
vi.mock("@/hooks/useArtistCatalogSongs", () => ({
  default: () => fixture.query,
}));
vi.mock("@/hooks/useCatalogSongsFileSelect", () => ({
  useCatalogSongsFileSelect: () => ({
    isUploading: false,
    uploadResult: null,
    uploadError: null,
    uploadProgress: { total: 0, current: 0 },
    handleFileSelect: vi.fn(),
  }),
}));
const props = {
  catalogId: "catalog",
  isSearchMode: false,
  searchLoading: false,
  searchError: null,
  activeIsrc: "",
};
beforeEach(() => {
  fixture.fetchNextPage.mockReset();
  fixture.query = {
    data: {
      pages: [
        {
          songs: [
            {
              catalog_id: "catalog",
              isrc: "SYNTH1",
              name: "Loaded song",
              artists: [],
            },
          ],
          pagination: {
            total_count: 10000,
            page: 1,
            limit: 50,
            total_pages: 200,
          },
        },
      ],
    },
    isLoading: false,
    error: null,
    hasNextPage: true,
    isFetchingNextPage: false,
    fetchNextPage: fixture.fetchNextPage,
  };
});
afterEach(cleanup);
it("requests more data only on explicit load, disables while pending and keeps rows after failure", () => {
  const { rerender } = render(<CatalogSongsDisplay {...props} />);
  expect(screen.getByText("Loaded song")).toBeTruthy();
  expect(fixture.fetchNextPage).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Load more songs" }));
  expect(fixture.fetchNextPage).toHaveBeenCalledTimes(1);
  fixture.query.isFetchingNextPage = true;
  rerender(<CatalogSongsDisplay {...props} />);
  expect(
    screen.getByRole("button", { name: "Loading more songs…" }),
  ).toHaveProperty("disabled", true);
  fixture.query.isFetchingNextPage = false;
  fixture.query.error = new Error("Synthetic page failure");
  rerender(<CatalogSongsDisplay {...props} />);
  expect(screen.getByText("Loaded song")).toBeTruthy();
  expect(screen.getByRole("status").textContent).toContain(
    "Couldn’t load more",
  );
  fireEvent.click(screen.getByRole("button", { name: "Load more songs" }));
  expect(fixture.fetchNextPage).toHaveBeenCalledTimes(2);
  fixture.query.hasNextPage = false;
  fixture.query.error = null;
  rerender(<CatalogSongsDisplay {...props} />);
  expect(screen.queryByRole("button", { name: "Load more songs" })).toBeNull();
});
