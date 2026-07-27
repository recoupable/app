import { redirect } from "next/navigation";

/**
 * Retired into `/setup/*` (chat#1889): `/setup/artists` is the canonical
 * roster step, so this interim standalone mount forwards there instead of
 * rendering a second copy of `RosterSocialsFlow`.
 *
 * Kept as a redirect rather than deleted so any pasted/indexed link still
 * resolves. Delete once logs show no traffic.
 */
const OnboardingRoster = () => {
  redirect("/setup/artists");
};

export default OnboardingRoster;
