// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import UsageTable from "@/components/UsagePage/UsageTable";

const event = {
  id: "evt-1",
  created_at: "2026-08-27T13:47:00.000Z",
  source: "api",
  agent_type: "main",
  provider: "fal",
  model_id: "minimax/music-3",
  input_tokens: 0,
  cached_input_tokens: 0,
  output_tokens: 0,
  tool_call_count: 0,
  credits_deducted: 120_000,
  usd: "$0.12",
};

describe("UsageTable", () => {
  it("makes Cost a button that asks for the cost sort, and back", () => {
    const onSortChange = vi.fn();
    render(
      <UsageTable
        events={[event]}
        sort="created_at"
        onSortChange={onSortChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Cost/ }));
    expect(onSortChange).toHaveBeenCalledWith("cost");
  });

  it("marks the active cost sort and toggles back to newest first", () => {
    const onSortChange = vi.fn();
    render(
      <UsageTable events={[event]} sort="cost" onSortChange={onSortChange} />,
    );
    const button = screen.getByRole("button", { name: /Cost/ });
    expect(
      button.getAttribute("aria-sort") ??
        button.closest("th")?.getAttribute("aria-sort"),
    ).toBe("descending");
    fireEvent.click(button);
    expect(onSortChange).toHaveBeenCalledWith("created_at");
  });

  it("keeps When, What ran and Cost on every width and collapses Model and Tokens below md", () => {
    render(
      <UsageTable
        events={[event]}
        sort="created_at"
        onSortChange={() => undefined}
      />,
    );
    const headers = screen.getAllByRole("columnheader");
    const byText = (t: string) =>
      headers.find((h) => (h.textContent ?? "").startsWith(t)) as HTMLElement;
    const collapses = (el: HTMLElement) => {
      const classes = el.className.split(/\s+/);
      return classes.includes("hidden") && classes.includes("md:table-cell");
    };
    expect(collapses(byText("Model"))).toBe(true);
    expect(collapses(byText("Tokens"))).toBe(true);
    for (const t of ["When", "What ran", "Cost"])
      expect(byText(t).className).not.toContain("hidden");
    // the cells follow their headers
    const cells = screen.getAllByRole("cell");
    expect(collapses(cells[2])).toBe(true);
    expect(collapses(cells[3])).toBe(true);
    expect(cells[4].textContent).toBe("$0.12");
    expect(cells[4].className).not.toContain("hidden");
  });
});
