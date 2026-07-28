import SetupValuation from "@/components/Onboarding/SetupValuation";

/**
 * `/setup/valuation` — the welcome email's payoff link. Renders the account's
 * baseline valuation (chat#1889) instead of the bare `/catalogs` redirect it
 * used to be, which left the email's "See your baseline valuation" link with no
 * real destination. Reading the valuation needs client state, so the page mounts
 * `SetupValuation`.
 */
export default function SetupValuationPage() {
  return <SetupValuation />;
}
