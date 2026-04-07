"use client";

import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import {
  fetchAccountEmails,
  type AccountEmail,
} from "@/lib/accounts/fetchAccountEmails";

interface UseAccountEmailsParams {
  accountIds: string[];
  enabled?: boolean;
}

/**
 * Fetches account email rows for one or more account IDs the authenticated user can access.
 */
export function useAccountEmails({
  accountIds,
  enabled = true,
}: UseAccountEmailsParams) {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery<AccountEmail[]>({
    queryKey: ["account-emails", accountIds],
    queryFn: async () => {
      if (accountIds.length === 0) {
        return [];
      }

      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to view account emails");
      }

      return fetchAccountEmails({
        accessToken,
        accountIds,
      });
    },
    enabled: enabled && accountIds.length > 0 && authenticated,
  });
}
