// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import CatalogExplorer from "../CatalogExplorer";
afterEach(cleanup);

describe("development catalog explorer", () => {
  it("bounds DOM rows and preserves exact selection through filters/pages/reset", () => {
    render(<CatalogExplorer />);
    expect(screen.getAllByRole("row")).toHaveLength(26);
    fireEvent.change(screen.getByRole("combobox", { name: "Source cohort" }), {
      target: { value: "luminate" },
    });
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Select Recording 00005" }),
    );
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Select Recording 00010" }),
    );
    expect(screen.getByRole("figure")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getAllByRole("row")).toHaveLength(26);
    expect(screen.getByText(/2 selected \(2 outside this page\)/)).toBeTruthy();
    fireEvent.change(
      screen.getByRole("textbox", { name: "Find recording or ID" }),
      { target: { value: "not found" } },
    );
    expect(screen.getAllByRole("row")).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "Remove Recording 00005" }),
    ).toBeTruthy();
    const text = screen.getByRole("textbox", {
      name: "Source-preserving text",
    }) as HTMLTextAreaElement;
    expect(text.value).toContain("synthetic:recording:00005");
    expect(text.value).toContain("EXACT LOCAL SELECTION");
    fireEvent.click(screen.getByRole("button", { name: "Reset local view" }));
    expect(screen.getAllByRole("row")).toHaveLength(26);
    expect(
      screen.queryByRole("button", { name: /Remove Recording/ }),
    ).toBeNull();
  });
  it("returns paging focus to the table without stealing filter or selection focus", () => {
    const { rerender } = render(<CatalogExplorer />);
    const query = screen.getByRole("textbox", { name: "Find recording or ID" });
    query.focus();
    fireEvent.change(query, { target: { value: "Recording 000" } });
    expect(document.activeElement).toBe(query);
    const table = screen.getByRole("region", { name: /Recording table/ });
    const next = screen.getByRole("button", { name: "Next page" });
    const previous = screen.getByRole("button", { name: "Previous page" });
    for (let page = 2; page <= 4; page += 1) {
      next.focus();
      fireEvent.click(next);
      expect(document.activeElement).toBe(table);
      const status = document.getElementById(
        table.getAttribute("aria-describedby")!,
      );
      expect(status?.textContent).toContain(`Page ${page} of 4`);
    }
    expect((next as HTMLButtonElement).disabled).toBe(true);
    const box = screen.getAllByRole("checkbox")[0];
    box.focus();
    fireEvent.click(box);
    rerender(<CatalogExplorer />);
    expect(document.activeElement).toBe(box);
    for (let page = 3; page >= 1; page -= 1) {
      previous.focus();
      fireEvent.click(previous);
      expect(document.activeElement).toBe(table);
    }
    expect((previous as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(next);
    query.focus();
    fireEvent.change(query, { target: { value: "not found" } });
    expect(document.activeElement).toBe(query);
    expect(screen.getByText(/No matching recordings/)).toBeTruthy();
  });
  it("refuses mixed sources and retains unchanged values in text fallback", () => {
    render(<CatalogExplorer />);
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Select Recording 00001" }),
    );
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Select Recording 00005" }),
    );
    const region = screen.getByRole("region", {
      name: "Selected recording comparison",
    });
    expect(within(region).queryByRole("figure")).toBeNull();
    expect(
      within(region).getByText(
        /Cumulative observations are not period streams/,
      ),
    ).toBeTruthy();
    const text = (
      screen.getByRole("textbox", {
        name: "Source-preserving text",
      }) as HTMLTextAreaElement
    ).value;
    expect(text).toContain("37 plays");
    expect(text).toContain("185 plays");
    expect(text).toContain("SYNTHETIC ONLY");
    expect(text).toContain("11 days old");
  });
  it("caps selection at eight but leaves selected checkboxes removable", () => {
    render(<CatalogExplorer />);
    const boxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    boxes.slice(0, 8).forEach((box) => fireEvent.click(box));
    expect(boxes[8].disabled).toBe(true);
    expect(boxes[0].disabled).toBe(false);
    fireEvent.click(boxes[0]);
    expect(boxes[8].disabled).toBe(false);
  });
});
