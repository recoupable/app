/**
 * Credits in one US dollar.
 *
 * Mirrors `api/lib/credits/creditUnit.ts`. Every conversion between credits
 * and dollars in this app goes through the helpers below, so changing the unit
 * is changing this number and nothing else.
 *
 * Today a credit is a cent. chat#2000 proposes a micro-dollar (1_000_000).
 * This must match the API and the values stored in
 * `credits_usage.remaining_credits`; changing it on one side only misprices
 * everything by the ratio between the two.
 */
export const CREDITS_PER_USD = 100;

/**
 * Dollar value of a credit amount.
 *
 * @param credits - Credit amount as the API reports it.
 * @returns Dollars, unformatted.
 */
export function creditsToUsd(credits: number): number {
  return credits / CREDITS_PER_USD;
}

/**
 * A credit balance as currency.
 *
 * Currency rather than a raw count, because a count is only readable while a
 * credit happens to be worth a cent. At a micro-dollar the same balance reads
 * "3,330,000", which tells a customer nothing they wanted to know.
 *
 * @param credits - Credit amount.
 * @returns USD string, e.g. "$3.33".
 */
export function formatCreditsAsUsd(credits: number): string {
  return `$${creditsToUsd(credits).toFixed(2)}`;
}
