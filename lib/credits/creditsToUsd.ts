import { formatUnits } from "viem";
import { CREDIT_DECIMALS } from "@/lib/credits/creditDecimals";

/**
 * Dollar value of a credit amount the API returned (viem's `formatUnits` at
 * the credit precision, so 92,440,000 → 92.44 exactly).
 *
 * @param credits - Credit amount, whole ledger units.
 * @returns Dollars, unformatted.
 */
export function creditsToUsd(credits: number): number {
  return Number(formatUnits(BigInt(Math.trunc(credits)), CREDIT_DECIMALS));
}
