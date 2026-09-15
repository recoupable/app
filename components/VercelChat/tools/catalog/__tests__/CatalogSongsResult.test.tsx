// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import CatalogSongsResult from "../CatalogSongsResult";
const upload = vi.hoisted(() =>
  vi.fn(() => ({
    isUploading: false,
    uploadResult: null,
    uploadError: null,
    uploadProgress: { total: 0, current: 0 },
    handleFileSelect: vi.fn(),
  })),
);
vi.mock("@/hooks/useCatalogSongsFileSelect", () => ({
  useCatalogSongsFileSelect: upload,
}));
afterEach(cleanup);
it("enables the first CSV upload with the catalog route ID and no songs", () => {
  render(
    <CatalogSongsResult
      result={{ success: true, songs: [] }}
      catalogId="new-catalog"
    />,
  );
  expect(upload).toHaveBeenCalledWith("new-catalog");
  expect(
    screen.getByRole("button", { name: "Upload CSV File" }),
  ).toHaveProperty("disabled", false);
});
