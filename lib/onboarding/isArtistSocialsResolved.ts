import type { ArtistSocialsVerification } from "./socialVerificationTypes";

/**
 * An artist's socials step is resolved when the user either recorded an
 * explicit "none", or gave every current social a verdict with at least
 * one confirmed. Verdicts for socials no longer on the artist (e.g.
 * replaced via a fix) are ignored.
 */
export function isArtistSocialsResolved(
  verification: ArtistSocialsVerification | undefined,
  socialIds: string[],
): boolean {
  if (!verification) return false;
  if (verification.none) return true;
  if (socialIds.length === 0) return false;

  const verdicts = socialIds.map((id) => verification.verdicts[id]);
  const allDecided = verdicts.every((verdict) => verdict !== undefined);
  const anyConfirmed = verdicts.some((verdict) => verdict === "confirmed");
  return allDecided && anyConfirmed;
}
