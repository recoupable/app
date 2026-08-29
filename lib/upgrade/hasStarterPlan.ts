import type { AccountCredits } from "@/lib/recoup/getAccountCredits";

/**
 * Whether the api sells Starter yet. The credits response carries `plan`
 * only once the plan-entitlements api (app#2044 row 3) is deployed, so the
 * Starter card is hidden against an api that would reject `plan: "starter"`.
 */
export function hasStarterPlan(credits: AccountCredits | undefined): boolean {
  return !!credits && "plan" in credits;
}
