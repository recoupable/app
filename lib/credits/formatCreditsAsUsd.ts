import { creditsToUsd } from "@/lib/credits/creditsToUsd";

/**
 * A credit amount as the currency string every customer-facing surface shows
 * (`$3.33`). Whole cents: the ledger carries sub-cent charges, but a balance
 * or a quote is read in cents.
 *
 * @param credits - Credit amount, whole ledger units.
 * @returns Dollars with two decimals and a leading `$`.
 */
export function formatCreditsAsUsd(credits: number): string {
  return `$${creditsToUsd(credits).toFixed(2)}`;
}
