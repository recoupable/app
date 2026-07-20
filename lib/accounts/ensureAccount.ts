import { fetchOrCreateAccount } from "@/lib/accounts/fetchOrCreateAccount";
import type { AccountWithDetails } from "@/lib/supabase/accounts/getAccountWithDetails";

interface EnsureAccountParams {
  email?: string;
  wallet?: string;
  accessToken?: string | null;
}

let inFlight: { key: string; promise: Promise<AccountWithDetails> } | null =
  null;
let chain: Promise<unknown> = Promise.resolve();

/**
 * Single-flight wrapper around `fetchOrCreateAccount` (POST /api/accounts).
 *
 * On a fresh signup the account bootstrap fires twice (once when the email
 * lands after passwordless auth, once when the embedded wallet is created).
 * Racing those POSTs creates an email-less orphan account row (chat#1875), so:
 * - identical concurrent calls share one in-flight request, and
 * - distinct concurrent calls run strictly one after another, letting the
 *   later call resolve to the account the earlier call already created.
 */
export function ensureAccount(
  params: EnsureAccountParams,
): Promise<AccountWithDetails> {
  const key = `${params.email ?? ""}|${params.wallet ?? ""}`;
  if (inFlight?.key === key) return inFlight.promise;

  const promise = chain.then(() => fetchOrCreateAccount(params));
  const entry = { key, promise };
  inFlight = entry;
  chain = promise.then(
    () => undefined,
    () => undefined,
  );
  promise.then(
    () => {
      if (inFlight === entry) inFlight = null;
    },
    () => {
      if (inFlight === entry) inFlight = null;
    },
  );
  return promise;
}
