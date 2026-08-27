import { parseUnits } from "viem";
import { CREDIT_DECIMALS } from "@/lib/credits/creditDecimals";

/**
 * Credits for a dollar amount, in whole ledger units: viem's `parseUnits` at
 * the credit precision, floored at one unit. Mirrors the API's function of the
 * same name so a price quoted in the app is the price the API charges.
 *
 * `parseUnits` takes a decimal string, and `String(usd)` switches to exponent
 * notation below 1e-6 (`"1e-7"`), which it rejects; `toFixed` always yields
 * fixed notation, rounded to the nearest unit.
 *
 * @param usd - Cost in dollars.
 * @returns Whole credits, minimum 1.
 */
export function usdToCredits(usd: number): number {
  return Math.max(1, Number(parseUnits(usd.toFixed(CREDIT_DECIMALS), CREDIT_DECIMALS)));
}
