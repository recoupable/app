/**
 * Catalog valuation band from lifetime platform-displayed Spotify play counts.
 *
 * Mirrors marketing/lib/valuation/computeCatalogValuation.ts (the house
 * assumption stack) with one difference: chat reads the catalog age directly
 * from the api's measurements endpoint (`catalog_age_years`, derived
 * server-side from the earliest Spotify release date) instead of computing it
 * from a release date. Annual run-rate uses the LIFETIME-AVERAGE proxy —
 * all-time streams ÷ catalog age — labeled as such. Front-loaded catalogs
 * read high on this proxy; evergreen ones read low. The page must present the
 * result as a directional model with assumptions visible.
 */

import {
  nlsBandFromSpotifyGross,
  GROSS_UP,
  DISTRIBUTION_FEE,
  ROYALTY_SHARE,
  type Band,
} from "@/lib/valuation/nlsBandFromSpotifyGross";

/** methodology.md §1 — public Spotify per-stream rate (2025 default). */
const SPOTIFY_PER_STREAM_USD = 0.0035;
/** methodology.md §4 — master-catalog NLS multiple band. */
const MULTIPLE = { low: 10, central: 13, high: 16 };

const DEFAULT_AGE_YEARS = 5;

export type { Band } from "@/lib/valuation/nlsBandFromSpotifyGross";

export type CatalogValuation = {
  totalStreams: number;
  catalogAgeYears: number;
  annualStreamsProxy: number;
  lifetimeNls: Band;
  annualNls: Band;
  valueBand: Band;
  assumptions: {
    spotifyPerStreamUsd: number;
    grossUp: Band;
    distributionFee: number;
    royaltyShare: number;
    multiple: Band;
    runRateBasis: "lifetime_average";
    ageSource: "reported" | "default_5y";
  };
};

export function computeCatalogValuation(params: {
  totalStreams: number;
  catalogAgeYears?: number | null;
}): CatalogValuation {
  const reportedAge = params.catalogAgeYears;
  const hasValidAge =
    typeof reportedAge === "number" &&
    Number.isFinite(reportedAge) &&
    reportedAge >= 1;
  const catalogAgeYears = hasValidAge ? reportedAge : DEFAULT_AGE_YEARS;
  const ageSource: CatalogValuation["assumptions"]["ageSource"] = hasValidAge
    ? "reported"
    : "default_5y";

  const annualStreamsProxy = params.totalStreams / catalogAgeYears;
  const lifetimeNls = nlsBandFromSpotifyGross(
    params.totalStreams * SPOTIFY_PER_STREAM_USD,
  );
  const annualNls = nlsBandFromSpotifyGross(
    annualStreamsProxy * SPOTIFY_PER_STREAM_USD,
  );

  return {
    totalStreams: params.totalStreams,
    catalogAgeYears,
    annualStreamsProxy,
    lifetimeNls,
    annualNls,
    valueBand: {
      low: annualNls.low * MULTIPLE.low,
      central: annualNls.central * MULTIPLE.central,
      high: annualNls.high * MULTIPLE.high,
    },
    assumptions: {
      spotifyPerStreamUsd: SPOTIFY_PER_STREAM_USD,
      grossUp: GROSS_UP,
      distributionFee: DISTRIBUTION_FEE,
      royaltyShare: ROYALTY_SHARE,
      multiple: MULTIPLE,
      runRateBasis: "lifetime_average",
      ageSource,
    },
  };
}
