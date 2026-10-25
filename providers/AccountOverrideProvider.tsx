"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
  useRef,
  ReactNode,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { fetchAccountIdByEmail } from "@/lib/accounts/fetchAccountIdByEmail";
import { getStoredAccountOverride } from "@/lib/accounts/override/getStoredAccountOverride";
import { setStoredAccountOverride } from "@/lib/accounts/override/setStoredAccountOverride";
import { clearStoredAccountOverride } from "@/lib/accounts/override/clearStoredAccountOverride";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

interface AccountOverrideContextType {
  accountIdOverride: string | null;
  email: string | null;
  clear: () => void;
}

const AccountOverrideContext = createContext<AccountOverrideContextType>({
  accountIdOverride: null,
  email: null,
  clear: () => {},
});

/**
 * Provider that manages the account override lifecycle.
 * Reads ?email= from URL, resolves to accountId, persists in session storage.
 * Single source of truth for all override consumers.
 * Placed inside PrivyProvider because it needs getAccessToken.
 */
export function AccountOverrideProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getAccessToken, user, authenticated } = usePrivy();
  const emailParam = searchParams.get("email");

  const [stored, setStored] = useState(getStoredAccountOverride);
  const [clearRequest, setClearRequest] = useState({
    emailParam,
    active: false,
  });
  if (clearRequest.emailParam !== emailParam) {
    setClearRequest({ emailParam, active: false });
  }
  const isClear =
    emailParam === "clear" ||
    (clearRequest.emailParam === emailParam && clearRequest.active);
  const email = isClear ? null : emailParam || stored.email;
  const actor = authenticated ? user?.id : undefined;
  const apiBaseUrl = getClientApiBaseUrl();
  const selection = useMemo(
    () => ({ actor, apiBaseUrl, email, isClear }),
    [actor, apiBaseUrl, email, isClear],
  );
  const current = useRef<typeof selection | null>(selection);
  useLayoutEffect(() => {
    current.current = selection;
    return () => {
      current.current = null;
    };
  }, [selection]);

  const { data: resolvedAccountId } = useQuery({
    queryKey: ["accountOverride", apiBaseUrl, actor, email, isClear],
    queryFn: async ({ signal }) => {
      if (isClear) {
        clearStoredAccountOverride();
        setStored({ accountId: null, email: null });
        return null;
      }
      const isCurrent = () =>
        !signal.aborted &&
        current.current === selection &&
        getClientApiBaseUrl() === apiBaseUrl;
      if (!actor || !email || !isCurrent()) return null;
      const accessToken = await getAccessToken();
      if (!accessToken || !isCurrent()) return null;
      const accountId = await fetchAccountIdByEmail(email, accessToken);
      if (!isCurrent()) return null;
      if (accountId) {
        setStoredAccountOverride(accountId, email);
        setStored({ accountId, email });
      }
      return accountId;
    },
    enabled: isClear || Boolean(actor && email),
    staleTime: isClear ? 0 : Infinity,
  });

  // Stored IDs may belong to a previous URL, actor or API origin. Resolve the
  // selected email in the current authenticated context before exposing an ID.
  const accountIdOverride =
    actor && !isClear ? (resolvedAccountId ?? null) : null;

  const clear = useCallback(() => {
    current.current = null;
    setClearRequest({ emailParam, active: true });
    clearStoredAccountOverride();
    setStored({ accountId: null, email: null });
    const params = new URLSearchParams(searchParams.toString());
    params.delete("email");
    const newPath = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    router.replace(newPath);
  }, [searchParams, router, emailParam]);

  return (
    <AccountOverrideContext.Provider
      value={{ accountIdOverride, email, clear }}
    >
      {children}
    </AccountOverrideContext.Provider>
  );
}

export function useAccountOverride() {
  return useContext(AccountOverrideContext);
}
