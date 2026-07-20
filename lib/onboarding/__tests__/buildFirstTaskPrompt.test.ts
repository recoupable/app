import { describe, expect, it } from "vitest";
import { buildFirstTaskPrompt } from "@/lib/onboarding/buildFirstTaskPrompt";

describe("buildFirstTaskPrompt", () => {
  it("names the artist and reads as a weekly catalog report brief", () => {
    const prompt = buildFirstTaskPrompt({ artistName: "Luh Tyler" });
    expect(prompt).toContain("Luh Tyler");
    expect(prompt.toLowerCase()).toContain("catalog report");
    expect(prompt.toLowerCase()).toContain("week");
  });

  it("mentions the catalog by name when one is provided", () => {
    const prompt = buildFirstTaskPrompt({
      artistName: "Luh Tyler",
      catalogName: "Tyler's Catalog",
    });
    expect(prompt).toContain('"Tyler\'s Catalog"');
  });

  it("omits the catalog clause when no catalog name is provided", () => {
    const prompt = buildFirstTaskPrompt({ artistName: "Luh Tyler" });
    expect(prompt).not.toContain('""');
    expect(prompt).not.toContain("undefined");
  });

  it("is identical for the pre-run and the scheduled task (pure)", () => {
    const input = { artistName: "Luh Tyler", catalogName: "Debut" };
    expect(buildFirstTaskPrompt(input)).toBe(buildFirstTaskPrompt(input));
  });
});
