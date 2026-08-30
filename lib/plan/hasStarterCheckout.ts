/**
 * Whether Starter can be bought: true once the api reports a `plan` field,
 * which arrives with the Starter price (app#2044 row 3). Before that the
 * subscriptions route rejects `plan`, so the Starter button stays hidden.
 */
export function hasStarterCheckout(credits: { plan?: string } | undefined): boolean {
  return credits?.plan !== undefined;
}
