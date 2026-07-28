export interface ConfirmRosterCopyInput {
  /** Artists on the roster, excluding the workspace pseudo-artist. */
  artistCount: number;
  /** Whether a valuation actually ran for this account (it has a catalog). */
  hasValuation: boolean;
}

/**
 * Sub-heading for the confirm-roster onboarding step.
 *
 * The provenance line ("we set these up from your valuation") is only true for
 * accounts that arrived through the valuation funnel. Two-thirds of
 * welcome-email signups did not, and they reach a populated roster by adding an
 * artist through the Spotify typeahead — so the claim is keyed on the valuation
 * having happened, not on the roster being non-empty (chat#1889).
 */
export function getConfirmRosterCopy({
  artistCount,
  hasValuation,
}: ConfirmRosterCopyInput): string {
  if (artistCount === 0) {
    return "Search Spotify for the artists you manage. Recoup uses them to measure your catalog, so pick the real profile.";
  }

  const tail =
    "Add anyone else you manage — you can verify their socials next.";

  if (!hasValuation) return tail;

  const subject = artistCount === 1 ? "this artist" : "these artists";
  return `We set ${subject} up from your valuation. ${tail}`;
}
