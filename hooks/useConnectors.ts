"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { fetchConnectorsApi } from "@/lib/composio/api/fetchConnectorsApi";
import { authorizeConnectorApi } from "@/lib/composio/api/authorizeConnectorApi";
import { disconnectConnectorApi } from "@/lib/composio/api/disconnectConnectorApi";

/**
 * Connector info from the API.
 */
export interface ConnectorInfo {
  slug: string;
  name: string;
  isConnected: boolean;
  connectedAccountId?: string;
}

/**
 * Connectors visible to end users.
 * Only these connectors will be shown on the settings page.
 */
const ALLOWED_CONNECTORS = ["googlesheets", "googledrive", "googledocs"];
const CONNECTORS_QUERY_KEY = "connectors";

interface UseConnectorsConfig {
  accountId?: string;
  allowedSlugs?: string[];
  callbackUrl?: string;
}

/**
 * Hook for managing connectors. Backed by React Query so every instance
 * (account-level and per-artist) shares one cache — `disconnect` /
 * `authorize` invalidate the keys, and sibling instances re-render with the
 * fresh list automatically.
 */
export function useConnectors(config?: UseConnectorsConfig) {
  const { accountId, allowedSlugs, callbackUrl } = config ?? {};
  const slugFilterKey = allowedSlugs?.join(",") ?? "";
  const slugFilter = useMemo(
    () => allowedSlugs ?? ALLOWED_CONNECTORS,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slugFilterKey],
  );
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [CONNECTORS_QUERY_KEY, accountId ?? null],
    enabled: accountId === undefined || Boolean(accountId),
    queryFn: async (): Promise<ConnectorInfo[]> => {
      const accessToken = await getAccessToken();
      if (!accessToken) return [];
      return fetchConnectorsApi(accessToken, accountId);
    },
  });

  const connectors = useMemo(() => {
    const allowed = new Set(slugFilter);
    return (query.data ?? []).filter((c) => allowed.has(c.slug.toLowerCase()));
  }, [query.data, slugFilter]);

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [CONNECTORS_QUERY_KEY] });
  }, [queryClient]);

  const authorize = useCallback(
    async (connector: string): Promise<string | null> => {
      if (accountId !== undefined && !accountId) return null;
      const accessToken = await getAccessToken();
      if (!accessToken) return null;
      return authorizeConnectorApi(accessToken, {
        connector,
        accountId,
        callbackUrl,
      });
    },
    [getAccessToken, accountId, callbackUrl],
  );

  const disconnect = useCallback(
    async (connectedAccountId: string): Promise<boolean> => {
      if (accountId !== undefined && !accountId) return false;
      const accessToken = await getAccessToken();
      if (!accessToken) return false;
      try {
        await disconnectConnectorApi(
          accessToken,
          connectedAccountId,
          accountId,
        );
        invalidateAll();
        return true;
      } catch {
        return false;
      }
    },
    [getAccessToken, accountId, invalidateAll],
  );

  return {
    connectors,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch,
    authorize,
    disconnect,
  };
}
