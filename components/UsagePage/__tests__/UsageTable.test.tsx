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
  resource_url: null,
};

describe("UsageTable", () => {
  it("shows When, Model / endpoint and Cost on every width, collapses Tokens below md, and has no What ran column", () => {
    render(<UsageTable events={[event]} />);
    const headers = screen
      .getAllByRole("columnheader")
      .map((h) => h.textContent);
    expect(headers).toEqual([
      "When",
      "Model / endpoint",
      "Tokens",
      "Cost",
      "Open",
    ]);
    const byText = (t: string) =>
      screen
        .getAllByRole("columnheader")
        .find((h) => h.textContent === t) as HTMLElement;
    const collapses = (el: HTMLElement) => {
      const classes = el.className.split(/\s+/);
      return classes.includes("hidden") && classes.includes("md:table-cell");
    };
    expect(collapses(byText("Tokens"))).toBe(true);
    for (const t of ["When", "Model / endpoint", "Cost"])
      expect(collapses(byText(t))).toBe(false);
    const cells = screen.getAllByRole("cell");
    expect(cells).toHaveLength(5);
    expect(cells[4].textContent).toBe("");
    expect(cells[0].textContent).toBe("Aug 27, 1:47 PM");
    expect(cells[1].textContent).toBe("fal / minimax/music-3");
    expect(collapses(cells[2])).toBe(true);
    expect(cells[3].textContent).toBe("$0.12");
    expect(screen.queryByText(/api · main/)).toBeNull();
  });
});
