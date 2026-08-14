import { describe, it, expect } from "vitest";
import { buildReportInsights } from "../buildReportInsights";

describe("buildReportInsights", () => {
  it("always includes the run-rate proxy diagnosis for the valuation section", () => {
    const insights = buildReportInsights({
      totalSongs: 10,
      measuredSongCount: 10,
      releaseStreamShares: [0.5, 0.5],
    });
    const valuation = insights.find((i) => i.section === "valuation");
    expect(valuation).toBeDefined();
    expect(valuation?.diagnosis.length).toBeGreaterThan(0);
    expect(valuation?.prescription.length).toBeGreaterThan(0);
  });

  it("flags measurement coverage gaps when some tracks are unmeasured", () => {
    const insights = buildReportInsights({
      totalSongs: 10,
      measuredSongCount: 6,
      releaseStreamShares: [1],
    });
    const coverage = insights.find((i) => i.section === "coverage");
    expect(coverage).toBeDefined();
    expect(coverage?.diagnosis).toContain("4");
  });

  it("omits the coverage insight when every track is measured", () => {
    const insights = buildReportInsights({
      totalSongs: 5,
      measuredSongCount: 5,
      releaseStreamShares: [1],
    });
    expect(insights.find((i) => i.section === "coverage")).toBeUndefined();
  });

  it("flags concentration when one release dominates streams", () => {
    const insights = buildReportInsights({
      totalSongs: 8,
      measuredSongCount: 8,
      releaseStreamShares: [0.8, 0.1, 0.1],
    });
    const concentration = insights.find((i) => i.section === "concentration");
    expect(concentration).toBeDefined();
    expect(concentration?.diagnosis).toContain("80%");
  });

  it("omits concentration for a balanced catalog", () => {
    const insights = buildReportInsights({
      totalSongs: 8,
      measuredSongCount: 8,
      releaseStreamShares: [0.4, 0.3, 0.3],
    });
    expect(insights.find((i) => i.section === "concentration")).toBeUndefined();
  });
});
