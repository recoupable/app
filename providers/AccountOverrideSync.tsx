"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { ACCOUNT_OVERRIDE_STORAGE_KEY } from "@/lib/consts";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export default function AccountOverrideSync() {
  const searchParams = useSearchParams();
  const { getAccessToken } = usePrivy();

  useEffect(() => {
    const emailParam = searchParams.get("email");

    try {
      if (emailParam === "clear") {
        window.sessionStorage.removeItem(ACCOUNT_OVERRIDE_STORAGE_KEY);
        return;
      }

      if (!emailParam) {
        return;
      }

      const resolve = async () => {
        const accessToken = await getAccessToken();
        if (!accessToken) return;

        const baseUrl = getClientApiBaseUrl();
        const response = await fetch(
          `${baseUrl}/api/accounts/${encodeURIComponent(emailParam)}`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );

        if (!response.ok) return;

        const data = await response.json();
        if (data.account?.account_id) {
          window.sessionStorage.setItem(
            ACCOUNT_OVERRIDE_STORAGE_KEY,
            data.account.account_id,
          );
        }
      };

      resolve();
    } catch {
      // Ignore fetch failures and storage errors.
    }
  }, [searchParams, getAccessToken]);

  return null;
}
