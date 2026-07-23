import { redirect } from "next/navigation";

/**
 * Funnel-entry convergence (chat#1885): marketing-funnel signups used to
 * deep-link to this standalone first-task mount, a surface distinct from the
 * unified `OnboardingSequence` that direct-chat signups see. Route the funnel
 * entry through the same surface by sending it to the home gate, which renders
 * `OnboardingSequence` at the account's DERIVED step (`useOnboardingGate` →
 * `HomePage`) — so both entry paths converge on one onboarding experience and
 * the funnel CTA always lands at the correct step, never a hard-coded one.
 *
 * Deferred (see PR): fully retire the interim standalone `/onboarding/*`
 * mounts (this route + `/onboarding/roster`) and repoint any external
 * deep-links once nothing references them.
 */
const FirstTaskOnboardingPage = () => {
  redirect("/");
};

export default FirstTaskOnboardingPage;
