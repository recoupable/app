export interface ReportInsight {
  section: "valuation" | "coverage" | "concentration";
  title: string;
  diagnosis: string;
  prescription: string;
}

const CONCENTRATION_THRESHOLD = 0.6;

/**
 * Derives the report's diagnosis + prescription copy from measured catalog
 * shape: what's suppressing the value and which Recoup behavior addresses it.
 * Pure so the copy rules are testable; sections that don't apply are omitted.
 *
 * @param params.totalSongs - Songs in the catalog
 * @param params.measuredSongCount - Songs with a captured play count
 * @param params.releaseStreamShares - Each release's share (0-1) of total streams
 */
export function buildReportInsights(params: {
  totalSongs: number;
  measuredSongCount: number;
  releaseStreamShares: number[];
}): ReportInsight[] {
  const insights: ReportInsight[] = [
    {
      section: "valuation",
      title: "This estimate is a lifetime-average proxy",
      diagnosis:
        "Your annual run-rate is estimated from lifetime streams divided by catalog age, not from real trailing-12-month data. Front-loaded catalogs read high on this proxy and evergreen ones read low.",
      prescription:
        "Track play counts weekly with Recoup to replace the proxy with a real run-rate. A measured trend line tightens the range and shows whether your value is climbing or decaying.",
    },
  ];

  const unmeasured = params.totalSongs - params.measuredSongCount;
  if (unmeasured > 0) {
    insights.push({
      section: "coverage",
      title: "Unmeasured tracks are suppressing this value",
      diagnosis: `${unmeasured} of ${params.totalSongs} tracks have no captured play count yet, so their streams contribute $0 to this estimate.`,
      prescription:
        "Complete the catalog so every track is measured. Ask Recoup to measure the missing tracks, or add their ISRCs in the Manage songs tab.",
    });
  }

  const topShare = Math.max(0, ...params.releaseStreamShares);
  if (
    params.releaseStreamShares.length > 1 &&
    topShare >= CONCENTRATION_THRESHOLD
  ) {
    insights.push({
      section: "concentration",
      title: "One release carries most of this catalog",
      diagnosis: `Your top release accounts for ${Math.round(topShare * 100)}% of measured streams. Buyers discount catalogs that depend on a single release.`,
      prescription:
        "Push listeners into the rest of the catalog: playlist pitches, deep-cut content, and release-cadence planning are all Recoup tasks you can schedule.",
    });
  }

  return insights;
}
