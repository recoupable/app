export type Band = { low: number; central: number; high: number };

// Mirrors marketing/lib/valuation/nlsBandFromSpotifyGross.ts (and the api's
// computeValuationBand) exactly so chat and marketing can never drift.
// Change constants in all places or not at all.

/** methodology.md §1 — other-DSP gross-up as a share of Spotify gross. */
export const GROSS_UP: Band = { low: 1.25, central: 1.4, high: 1.6 };
/** methodology.md §2 — distribution fee + blended artist/producer royalties. */
export const DISTRIBUTION_FEE = 0.15;
export const ROYALTY_SHARE = 0.25;

/**
 * Net label share band from a Spotify-only gross: gross up to all DSPs
 * (low/central/high), then take the post-distribution, post-royalty share.
 *
 * @param spotifyGross - Spotify-only gross revenue in USD
 */
export function nlsBandFromSpotifyGross(spotifyGross: number): Band {
  const net = (1 - DISTRIBUTION_FEE) * (1 - ROYALTY_SHARE);
  return {
    low: spotifyGross * GROSS_UP.low * net,
    central: spotifyGross * GROSS_UP.central * net,
    high: spotifyGross * GROSS_UP.high * net,
  };
}
