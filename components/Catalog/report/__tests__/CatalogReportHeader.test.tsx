// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CatalogReportPage from "../CatalogReportPage";
const { header, body } = vi.hoisted(() => ({
  header: {
    catalogName: undefined as string | undefined,
    totalSongs: undefined as number | undefined,
  },
  body: { state: "loading" },
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/hooks/useCatalogReportHeader", () => ({
  useCatalogReportHeader: () => header,
}));
vi.mock("../CatalogReportContent", () => ({
  default: () => <p>Report state: {body.state}</p>,
}));
vi.mock("@/components/Catalog/CatalogSongsPageContent", () => ({
  default: () => <p>Manage songs</p>,
}));
afterEach(cleanup);
describe("catalog page header", () => {
  it.each(["loading", "measuring", "error", "no_streams", "ready"])(
    "retains catalog name and true total outside %s report body",
    (state) => {
      header.catalogName = "Original catalog name";
      header.totalSongs = 1234;
      body.state = state;
      render(<CatalogReportPage catalogId="second" />);
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
        "Original catalog name — Catalog Report",
      );
      expect(screen.getByText("1,234 songs in catalog")).toBeTruthy();
      expect(screen.getByText(`Report state: ${state}`)).toBeTruthy();
    },
  );
  it("distinguishes unavailable total from known zero", () => {
    header.catalogName = "Empty catalog";
    header.totalSongs = undefined;
    const view = render(<CatalogReportPage catalogId="empty" />);
    expect(screen.getByText("Total songs unknown")).toBeTruthy();
    header.totalSongs = 0;
    view.rerender(<CatalogReportPage catalogId="empty" />);
    expect(screen.getByText("0 songs in catalog")).toBeTruthy();
  });
  it("uses generic heading with no unverified identity", () => {
    header.catalogName = undefined;
    header.totalSongs = undefined;
    render(<CatalogReportPage catalogId="foreign" />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Catalog Report",
    );
    expect(screen.getByText("Total songs unknown")).toBeTruthy();
  });
});
