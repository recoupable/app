"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/**
 * Resolves an email address to an account ID via GET /api/accounts/{email}.
 *
 * @param email - Optional email to resolve
 * @returns The resolved account ID, or undefined if not yet resolved or no email
 */
export function useEmailAccountId(email?: string) {
  const { getAccessToken } = usePrivy();
  const [accountId, setAccountId] = useState<string>();

  useEffect(() => {
    if (!email) return;

    const resolve = async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const baseUrl = getClientApiBaseUrl();
      const response = await fetch(
        `${baseUrl}/api/accounts/${encodeURIComponent(email)}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!response.ok) return;

      const data = await response.json();
      if (data.account?.account_id) {
        setAccountId(data.account.account_id);
      }
    };

    resolve();
  }, [email, getAccessToken]);

  return accountId;
}
