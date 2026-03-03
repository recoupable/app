"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccessToken } from "@/hooks/useAccessToken";
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
  const accessToken = useAccessToken();

  const [connectors, setConnectors] = useState<ConnectorInfo[]>([]);
  const [isLoading, setIsLoading] = useState(!accountId);
  const [error, setError] = useState<string | null>(null);

  const fetchConnectors = useCallback(async () => {
    if (!accessToken || (accountId !== undefined && !accountId)) {
      if (accountId !== undefined) setConnectors([]);
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
  }, [accessToken, accountId, slugFilter]);

  const authorize = useCallback(
    async (connector: string): Promise<string | null> => {
      if (!accessToken) return null;
      if (accountId !== undefined && !accountId) return null;

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
    [accessToken, accountId, callbackUrl],
  );

  const disconnect = useCallback(
    async (connectedAccountId: string): Promise<boolean> => {
      if (!accessToken) return false;
      if (accountId !== undefined && !accountId) return false;

      try {
        await disconnectConnectorApi(accessToken, connectedAccountId, accountId);
        await fetchConnectors();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      }
    },
    [accessToken, accountId, fetchConnectors],
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
