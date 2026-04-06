"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { fetchAccountIdByEmail } from "@/lib/accounts/fetchAccountIdByEmail";
import { getStoredAccountOverride } from "@/lib/accounts/override/getStoredAccountOverride";
import { setStoredAccountOverride } from "@/lib/accounts/override/setStoredAccountOverride";
import { clearStoredAccountOverride } from "@/lib/accounts/override/clearStoredAccountOverride";

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
  const { getAccessToken } = usePrivy();
  const emailParam = searchParams.get("email");

  const [stored, setStored] = useState(getStoredAccountOverride);
  const email = emailParam || stored.email;
  const isClear = emailParam === "clear";

  const { data: resolvedAccountId } = useQuery({
    queryKey: ["accountOverride", email],
    queryFn: async () => {
      if (isClear) {
        clearStoredAccountOverride();
        setStored({ accountId: null, email: null });
        return null;
      }
      const accessToken = await getAccessToken();
      if (!accessToken) return null;
      const accountId = await fetchAccountIdByEmail(email!, accessToken);
      if (accountId && email) {
        setStoredAccountOverride(accountId, email);
        setStored({ accountId, email });
      }
      return accountId;
    },
    enabled: (!!email || isClear) && !stored.accountId,
    staleTime: Infinity,
  });

  const accountIdOverride = stored.accountId || resolvedAccountId || null;

  const clear = useCallback(() => {
    clearStoredAccountOverride();
    setStored({ accountId: null, email: null });
    const params = new URLSearchParams(searchParams.toString());
    params.delete("email");
    const newPath = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    router.replace(newPath);
  }, [searchParams, router]);

  return (
    <AccountOverrideContext.Provider value={{ accountIdOverride, email, clear }}>
      {children}
    </AccountOverrideContext.Provider>
  );
}

export function useAccountOverride() {
  return useContext(AccountOverrideContext);
}
