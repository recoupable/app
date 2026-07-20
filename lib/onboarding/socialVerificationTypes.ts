/**
 * Client-side confirmation state for the socials verification onboarding
 * step. Deliberately ephemeral: there is no server-side "verified" flag —
 * confirming keeps the auto-matched social, fixing replaces it via the
 * existing PATCH /api/artists/{id} profileUrls path, and an explicit
 * "none" lets an artist with no (correct) socials pass the step.
 */
export type SocialVerdict = "confirmed" | "rejected";

export interface ArtistSocialsVerification {
  /** Verdict per social id (`socials.id`) on the artist. */
  verdicts: Record<string, SocialVerdict>;
  /** Explicit "this artist has no socials" — supersedes verdicts. */
  none: boolean;
}

/** Keyed by artist account id. */
export type SocialsVerificationState = Record<
  string,
  ArtistSocialsVerification
>;
