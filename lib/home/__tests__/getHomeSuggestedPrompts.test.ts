import { describe, expect, it } from "vitest";
import { getHomeSuggestedPrompts } from "@/lib/home/getHomeSuggestedPrompts";

describe("getHomeSuggestedPrompts", () => {
  it("wires chips to the visible modules", () => {
    const prompts = getHomeSuggestedPrompts({
      hasValuation: true,
      hasRuns: true,
      artistName: "Del Water Gap",
      catalogName: "",
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
      catalogName: "",
    });
    expect(prompts.length).toBeLessThanOrEqual(3);
  });

  it("falls back to a catalog-value chip when no valuation is shown", () => {
    const prompts = getHomeSuggestedPrompts({
      hasValuation: false,
      hasRuns: false,
      artistName: "Del Water Gap",
      catalogName: "",
    });

    expect(prompts.map((p) => p.label)).toEqual([
      "What's my catalog worth?",
      "What should Del Water Gap do this week?",
    ]);
  });

  it("anchors the catalog-value prompt to the claimed catalog when one exists", () => {
    const prompts = getHomeSuggestedPrompts({
      hasValuation: false,
      hasRuns: false,
      artistName: "Del Water Gap",
      catalogName: "Del Water Gap Catalog",
    });

    const chip = prompts.find((p) => p.label === "What's my catalog worth?");
    expect(chip).toBeDefined();
    expect(chip?.prompt).toContain('"Del Water Gap Catalog"');
    expect(chip?.prompt).toMatch(/songs already in my Recoup catalog/i);
  });

  it("keeps the generic estimate prompt when no catalog is claimed", () => {
    const prompts = getHomeSuggestedPrompts({
      hasValuation: false,
      hasRuns: false,
      artistName: "Del Water Gap",
      catalogName: "",
    });

    const chip = prompts.find((p) => p.label === "What's my catalog worth?");
    expect(chip?.prompt).toContain("Del Water Gap");
    expect(chip?.prompt).toContain("public streaming data");
  });

  it("omits the artist chip when no artist is selected", () => {
    const prompts = getHomeSuggestedPrompts({
      hasValuation: true,
      hasRuns: false,
      artistName: "",
      catalogName: "",
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
      catalogName: "",
    });
    for (const p of prompts) {
      expect(p.prompt.length).toBeGreaterThan(10);
    }
  });
});
