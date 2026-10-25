// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import CatalogTracksTable from "../CatalogTracksTable";
import type { CatalogSong } from "@/lib/catalog/getCatalogSongs";
afterEach(cleanup);
const measurements = Array.from({ length: 101 }, (_, i) => ({
  isrc: `ISRC${i}`,
  title: `Capture ${i}`,
  playcount: i,
  measured_at: "2026-10-25T00:00:00Z",
}));
describe("saved track observations", () => {
  it("bounds rows to 50 and reaches every returned observation", () => {
    render(<CatalogTracksTable measurements={measurements} />);
    expect(screen.getAllByRole("row")).toHaveLength(51);
    expect(screen.getByText("0")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Last page of returned songs" }),
    );
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getByText("Capture 100")).toBeTruthy();
  });
  it("preserves the page on append and clamps replacement", () => {
    const { rerender } = render(
      <CatalogTracksTable measurements={measurements.slice(0, 100)} />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Next page of returned songs" }),
    );
    rerender(<CatalogTracksTable measurements={measurements} />);
    expect(screen.getByText("Capture 50")).toBeTruthy();
    rerender(<CatalogTracksTable measurements={measurements.slice(0, 1)} />);
    expect(screen.getByText("Capture 0")).toBeTruthy();
  });
  it("joins exact ISRC, never titles or position", () => {
    const songs = [
      {
        isrc: "ISRC1",
        name: "Matched title",
        artists: [{ name: "Correct artist" }],
      },
      { isrc: "isrc0", name: "Wrong case", artists: [] },
    ] as CatalogSong[];
    render(
      <CatalogTracksTable
        measurements={measurements.slice(0, 2)}
        songs={songs}
      />,
    );
    expect(screen.queryByText("Wrong case")).toBeNull();
    const row = screen.getByText("Matched title").closest("tr")!;
    expect(within(row).getByText("1")).toBeTruthy();
    expect(within(row).getByText("Correct artist")).toBeTruthy();
    expect(screen.getByText("Capture 0")).toBeTruthy();
  });
  it.each([
    null,
    undefined,
    -1,
    NaN,
    Infinity,
    0.5,
    Number.MAX_SAFE_INTEGER + 1,
  ])("keeps invalid or missing count %s unknown", (playcount) => {
    render(<CatalogTracksTable measurements={[{ isrc: "A", playcount }]} />);
    const cells = screen.getAllByRole("cell");
    expect(cells[3].textContent).toBe("Unknown");
    expect(cells[4].textContent).toBe("Unknown");
  });
  it("retains observations and rejects ambiguous metadata joins", () => {
    render(
      <CatalogTracksTable
        measurements={[
          { isrc: "A", title: "Observed", playcount: 0 },
          { isrc: "A", title: "Other observation", playcount: 12 },
        ]}
        songs={
          [
            { isrc: "A", name: "One" },
            { isrc: "A", name: "Two" },
          ] as CatalogSong[]
        }
      />,
    );
    expect(screen.queryByText("One")).toBeNull();
    expect(screen.queryByText("Two")).toBeNull();
    expect(screen.getByText("Observed")).toBeTruthy();
    expect(screen.getByText("Other observation")).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
  });
  it("does not manufacture rows from unmeasured metadata", () => {
    const { container } = render(
      <CatalogTracksTable
        measurements={[]}
        songs={[{ isrc: "A", name: "No observation" }] as CatalogSong[]}
      />,
    );
    expect(container.textContent).toBe("");
  });
});
