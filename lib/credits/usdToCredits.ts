import { parseUnits } from "viem";
import { CREDIT_DECIMALS } from "@/lib/credits/creditDecimals";

/**
 * Credits for a dollar amount, in whole ledger units. Mirrors the API's
 * function of the same name so a price quoted in the app is the price the
 * API charges: the dollar figure is truncated to `CREDIT_DECIMALS` before
 * `parseUnits` (no rounding up) and the result is at least one unit.
 *
 * @param usd - Cost in dollars.
 * @returns Whole credits, minimum 1.
 */
export function usdToCredits(usd: number): number {
  const [whole, fraction = ""] = usd.toFixed(CREDIT_DECIMALS + 2).split(".");
  const truncated = `${whole}.${fraction.slice(0, CREDIT_DECIMALS)}`;
  return Math.max(1, Number(parseUnits(truncated, CREDIT_DECIMALS)));
}
