import { describe, expect, it } from "vitest";
import { PLAN_COLUMNS, PLAN_TABLE_ROWS } from "@/lib/plan/planTable";

describe("plan table", () => {
  it("has exactly Free, Starter and Pro, with Pro priced as 3x credits", () => {
    expect(PLAN_COLUMNS.map((c) => c.id)).toEqual(["free", "starter", "pro"]);
    expect(PLAN_COLUMNS.map((c) => c.price)).toEqual(["$0", "$19/mo", "$99/mo, 3x credits"]);
  });

  it("lists the approved rows in the approved order", () => {
    expect(PLAN_TABLE_ROWS.map((r) => r.label)).toEqual([
      "Agent credits every month",
      "Report runs that buys",
      "Scheduled tasks",
      "Fastest cadence",
      "Reports emailed to",
      "API keys",
      "Daily social monitoring",
      "Card required",
    ]);
  });

  it("carries the approved cell values", () => {
    const byLabel = Object.fromEntries(PLAN_TABLE_ROWS.map((r) => [r.label, r.cells]));
    expect(byLabel["Agent credits every month"]).toEqual(["$3.33", "$20", "$300"]);
    expect(byLabel["Report runs that buys"]).toEqual(["~4", "~26", "~391"]);
    expect(byLabel["Scheduled tasks"]).toEqual(["1", "3", "Unlimited"]);
    expect(byLabel["Fastest cadence"]).toEqual(["Weekly", "Daily", "Hourly"]);
    expect(byLabel["Reports emailed to"]).toEqual(["You", "You", "Anyone"]);
    expect(byLabel["API keys"]).toEqual(["check", "check", "check"]);
    expect(byLabel["Daily social monitoring"]).toEqual(["dash", "dash", "check"]);
    expect(byLabel["Card required"]).toEqual(["No", "Yes", "Yes"]);
  });

  it("has a short label for every row and no em or en dashes anywhere", () => {
    for (const row of PLAN_TABLE_ROWS) {
      expect(row.mobileLabel.length).toBeLessThanOrEqual(18);
      expect(`${row.label}${row.mobileLabel}${row.cells.join("")}`).not.toMatch(/[–—]/);
    }
  });
});
