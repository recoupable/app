"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { ACCOUNT_OVERRIDE_STORAGE_KEY } from "@/lib/consts";
import { fetchAccountIdByEmail } from "@/lib/accounts/fetchAccountIdByEmail";

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

  const [storedEmail, setStoredEmail] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(`${ACCOUNT_OVERRIDE_STORAGE_KEY}_email`);
  });

  const [storedAccountId, setStoredAccountId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(ACCOUNT_OVERRIDE_STORAGE_KEY);
  });

  const email = emailParam || storedEmail;

  const { data: resolvedAccountId } = useQuery({
    queryKey: ["accountOverride", email],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) return null;
      return fetchAccountIdByEmail(email!, accessToken);
    },
    enabled: !!email && email !== "clear" && !storedAccountId,
    staleTime: Infinity,
  });

  const accountIdOverride = storedAccountId || resolvedAccountId || null;

  useEffect(() => {
    try {
      if (emailParam === "clear") {
        window.sessionStorage.removeItem(ACCOUNT_OVERRIDE_STORAGE_KEY);
        window.sessionStorage.removeItem(`${ACCOUNT_OVERRIDE_STORAGE_KEY}_email`);
        setStoredAccountId(null);
        setStoredEmail(null);
        return;
      }

      if (resolvedAccountId && email) {
        window.sessionStorage.setItem(ACCOUNT_OVERRIDE_STORAGE_KEY, resolvedAccountId);
        window.sessionStorage.setItem(`${ACCOUNT_OVERRIDE_STORAGE_KEY}_email`, email);
        setStoredAccountId(resolvedAccountId);
        setStoredEmail(email);
      }
    } catch {
      // Ignore storage errors.
    }
  }, [emailParam, email, resolvedAccountId]);

  const clear = useCallback(() => {
    window.sessionStorage.removeItem(ACCOUNT_OVERRIDE_STORAGE_KEY);
    window.sessionStorage.removeItem(`${ACCOUNT_OVERRIDE_STORAGE_KEY}_email`);
    setStoredAccountId(null);
    setStoredEmail(null);
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
