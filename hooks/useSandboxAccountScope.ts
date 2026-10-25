import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccountOverride } from "@/providers/AccountOverrideProvider";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/** Reads can target an override; existing write endpoints only target self. */
export function useSandboxAccountScope() {
  const { user, authenticated } = usePrivy();
  const { accountIdOverride, email } = useAccountOverride();
  const actor = authenticated === false ? "" : (user?.id ?? "");
  const apiBaseUrl = getClientApiBaseUrl();
  const context = useMemo(
    () => ({ actor, accountIdOverride, email, apiBaseUrl }),
    [actor, accountIdOverride, email, apiBaseUrl],
  );
  const current = useRef<typeof context | null>(context);
  useLayoutEffect(() => {
    current.current = context;
    return () => {
      current.current = null;
    };
  }, [context]);
  const isCurrent = useCallback(
    () => current.current === context && getClientApiBaseUrl() === apiBaseUrl,
    [context, apiBaseUrl],
  );
  return {
    accountId: accountIdOverride,
    apiBaseUrl,
    scopeKey:
      accountIdOverride || email
        ? JSON.stringify([actor, accountIdOverride, email])
        : actor,
    ready: Boolean(actor && (!email || accountIdOverride)),
    readOnly: Boolean(accountIdOverride || email),
    isCurrent,
  };
}
