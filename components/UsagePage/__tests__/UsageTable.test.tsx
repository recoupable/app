// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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
  it("keeps When, What ran and Cost on every width and collapses Model and Tokens below md", () => {
    render(<UsageTable events={[event]} />);
    const headers = screen.getAllByRole("columnheader");
    const byText = (t: string) =>
      headers.find((h) => h.textContent === t) as HTMLElement;
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
