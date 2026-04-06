"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { ACCOUNT_OVERRIDE_STORAGE_KEY } from "@/lib/consts";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/**
 * Syncs the ?email= query param to session storage as an account ID override.
 * Follows the same pattern as ApiOverrideSync.
 * Placed inside PrivyProvider because it needs getAccessToken for the API call.
 */
export default function AccountOverrideSync() {
  const searchParams = useSearchParams();
  const { getAccessToken } = usePrivy();
  const emailParam = searchParams.get("email");

  const { data: accountId } = useQuery({
    queryKey: ["accountOverride", emailParam],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) return null;

      const baseUrl = getClientApiBaseUrl();
      const response = await fetch(
        `${baseUrl}/api/accounts/${encodeURIComponent(emailParam!)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (!response.ok) return null;

      const data = await response.json();
      return data.account?.account_id ?? null;
    },
    enabled: !!emailParam && emailParam !== "clear",
    staleTime: Infinity,
  });

  useEffect(() => {
    try {
      if (emailParam === "clear") {
        window.sessionStorage.removeItem(ACCOUNT_OVERRIDE_STORAGE_KEY);
        return;
      }

      if (accountId) {
        window.sessionStorage.setItem(ACCOUNT_OVERRIDE_STORAGE_KEY, accountId);
      }
    } catch {
      // Ignore storage errors.
    }
  }, [emailParam, accountId]);

  return null;
}
