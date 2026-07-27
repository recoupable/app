import { redirect } from "next/navigation";

/**
 * Retired into `/setup/*` (chat#1889): `/setup` is the canonical onboarding
 * sequence, so this interim standalone mount forwards to the matching setup
 * route instead of rendering a parallel flow.
 *
 * Kept as a redirect rather than deleted — the catalog report's primary CTA
 * (the marketing funnel's and the valuation email's landing page) and any
 * pasted/indexed link still resolve here. Delete once logs show no traffic.
 */
const FirstTaskOnboardingPage = () => {
  redirect("/setup/tasks");
};

export default FirstTaskOnboardingPage;
