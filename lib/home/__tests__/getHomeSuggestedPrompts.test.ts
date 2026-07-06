import { describe, expect, it } from "vitest";
import { getHomeSuggestedPrompts } from "@/lib/home/getHomeSuggestedPrompts";

describe("getHomeSuggestedPrompts", () => {
  it("wires chips to the visible modules", () => {
    const prompts = getHomeSuggestedPrompts({
      hasValuation: true,
      hasRuns: true,
      artistName: "Del Water Gap",
    });

    expect(prompts.map((p) => p.label)).toEqual([
      "Why did my valuation change?",
      "What did my last task run do?",
      "What should Del Water Gap do this week?",
    ]);
  });

  it("caps at three chips", () => {
    const prompts = getHomeSuggestedPrompts({
      hasValuation: true,
      hasRuns: true,
      artistName: "Del Water Gap",
    });
    expect(prompts.length).toBeLessThanOrEqual(3);
  });

  it("falls back to a catalog-value chip when no valuation is shown", () => {
    const prompts = getHomeSuggestedPrompts({
      hasValuation: false,
      hasRuns: false,
      artistName: "Del Water Gap",
    });

    expect(prompts.map((p) => p.label)).toEqual([
      "What's my catalog worth?",
      "What should Del Water Gap do this week?",
    ]);
  });

  it("omits the artist chip when no artist is selected", () => {
    const prompts = getHomeSuggestedPrompts({
      hasValuation: true,
      hasRuns: false,
      artistName: "",
    });

    expect(prompts.map((p) => p.label)).toEqual([
      "Why did my valuation change?",
    ]);
  });

  it("provides a sendable prompt for every chip", () => {
    const prompts = getHomeSuggestedPrompts({
      hasValuation: true,
      hasRuns: true,
      artistName: "Del Water Gap",
    });
    for (const p of prompts) {
      expect(p.prompt.length).toBeGreaterThan(10);
    }
  });
});
