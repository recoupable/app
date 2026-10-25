import {
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccountOverride } from "@/providers/AccountOverrideProvider";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export interface TaskRunScopeOptions {
  accountIdOverride?: string;
}

/** URL account_id explicitly wins; absent it, an unresolved email blocks reads. */
export function useTaskRunScope({
  accountIdOverride,
}: TaskRunScopeOptions = {}) {
  const { user, authenticated, getAccessToken } = usePrivy();
  const selection = useAccountOverride();
  const actor = authenticated ? (user?.id ?? "") : "";
  const readerId = useId();
  // Keep a previous login's successful cache out of a later login, even when
  // Privy retains the user object or the same user signs back in.
  const [session, setSession] = useState({ actor, generation: 0 });
  if (session.actor !== actor) {
    setSession({ actor, generation: session.generation + 1 });
  }
  const explicit = accountIdOverride !== undefined;
  const accountId = explicit
    ? accountIdOverride
    : (selection.accountIdOverride ?? undefined);
  const email = explicit ? null : selection.email;
  const apiBaseUrl = getClientApiBaseUrl();
  const ready = Boolean(actor && (explicit ? accountId : !email || accountId));
  const scopeKey = JSON.stringify([
    readerId,
    session.generation,
    actor,
    accountId,
    email,
    apiBaseUrl,
  ]);
  const context = useMemo(() => ({ scopeKey, ready }), [scopeKey, ready]);
  const current = useRef<typeof context | null>(context);
  useLayoutEffect(() => {
    current.current = context;
    return () => {
      current.current = null;
    };
  }, [context]);

  const read = useCallback(
    async <T>(signal: AbortSignal, request: (token: string) => Promise<T>) => {
      const assertCurrent = () => {
        if (
          !ready ||
          signal.aborted ||
          current.current !== context ||
          getClientApiBaseUrl() !== apiBaseUrl
        ) {
          throw new Error(
            "The account or connection changed. Reload the runs.",
          );
        }
      };
      assertCurrent();
      const token = await getAccessToken();
      assertCurrent();
      if (!token) throw new Error("Please sign in to view runs.");
      const data = await request(token);
      assertCurrent();
      return data;
    },
    [ready, context, apiBaseUrl, getAccessToken],
  );

  return { accountId, apiBaseUrl, scopeKey, ready, read };
}
