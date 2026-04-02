"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

interface UseConnectorsConfig {
  accountId?: string;
  allowedSlugs?: string[];
  callbackUrl?: string;
}

/**
 * Hook for managing connectors.
 * Works for both user-level and artist-level connectors via optional config.
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

  const [connectors, setConnectors] = useState<ConnectorInfo[]>([]);
  const [isLoading, setIsLoading] = useState(!accountId);
  const [error, setError] = useState<string | null>(null);

  const fetchConnectors = useCallback(async () => {
    if (accountId !== undefined && !accountId) {
      setConnectors([]);
      setIsLoading(false);
      return;
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const allConnectors = await fetchConnectorsApi(accessToken, accountId);
      const allowed = new Set(slugFilter);
      const visible = allConnectors.filter((c) =>
        allowed.has(c.slug.toLowerCase()),
      );
      setConnectors(visible);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, accountId, slugFilter]);

  const authorize = useCallback(
    async (connector: string): Promise<string | null> => {
      if (accountId !== undefined && !accountId) return null;

      const accessToken = await getAccessToken();
      if (!accessToken) return null;

      try {
        return await authorizeConnectorApi(accessToken, {
          connector,
          accountId,
          callbackUrl,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      }
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
        await fetchConnectors();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      }
    },
    [getAccessToken, accountId, fetchConnectors],
  );

  useEffect(() => {
    fetchConnectors();
  }, [fetchConnectors]);

  return {
    connectors,
    isLoading,
    error,
    refetch: fetchConnectors,
    authorize,
    disconnect,
  };
}
