/**
 * Decimal places in a credit: the single definition of what a credit is worth.
 *
 * Six, the same unit as USDC: 1,000,000 credits = $1.00, so a credit is a
 * micro-dollar. Every conversion between credits and dollars goes through
 * `usdToCredits` or `creditsToUsd`, which are viem's `parseUnits` /
 * `formatUnits` at this precision.
 *
 * Must match `api/lib/credits/creditDecimals.ts` and the values the API
 * returns (recoupable/app#2000); deploys together with api#855.
 */
export const CREDIT_DECIMALS = 6;
