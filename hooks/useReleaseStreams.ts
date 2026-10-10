"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { requestStreamData } from "@/lib/releases/requestStreamData";
import { useReleaseStreamCatalogChoices } from "./useReleaseStreamCatalogChoices";
import { useCatalogStreamRead } from "./useCatalogStreamRead";

/** The parent keys this hook's component by account and workspace. */
export function useReleaseStreams(
  accountId: string,
  getAccessToken: () => Promise<string | null>,
  organizationId: string | null = null,
) {
  const tokenReader = useRef(getAccessToken);
  useEffect(() => {
    tokenReader.current = getAccessToken;
  }, [getAccessToken]);
  const getToken = useCallback(() => tokenReader.current(), []);
  const [catalogId, setCatalogId] = useState("");
  const [days, setDays] = useState(28);
  const [reload, setReload] = useState(0);
  const [enabling, setEnabling] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const lifetime = useRef<AbortController | null>(null);
  const choices = useReleaseStreamCatalogChoices(
    accountId,
    organizationId,
    getToken,
    setCatalogId,
  );
  useEffect(() => {
    const controller = new AbortController();
    lifetime.current = controller;
    return () => controller.abort();
  }, []);
  const visible = useCatalogStreamRead(catalogId, days, reload, getToken);
  const selectCatalog = (id: string) => {
    if (enabling) return;
    setMutationError("");
    setCatalogId(id);
  };
  const enable = async () => {
    if (
      !catalogId ||
      enabling ||
      !lifetime.current ||
      lifetime.current.signal.aborted
    )
      return;
    const controller = lifetime.current;
    setEnabling(true);
    setMutationError("");
    try {
      await requestStreamData(
        `catalogs/${encodeURIComponent(catalogId)}/stream-tracking`,
        () => tokenReader.current(),
        controller.signal,
        { action: "enable" },
      );
      if (!controller.signal.aborted) setReload((value) => value + 1);
    } catch {
      if (!controller.signal.aborted)
        setMutationError("Could not enable daily tracking. Please retry.");
    } finally {
      if (!controller.signal.aborted) setEnabling(false);
    }
  };
  return {
    catalogs: choices.catalogs,
    catalogId,
    selectCatalog,
    days,
    setDays,
    catalogsLoading: choices.catalogsLoading,
    catalogError: choices.catalogError,
    history: visible.history,
    tracking: visible.tracking,
    error: visible.error,
    loading: visible.loading,
    enabling,
    mutationError,
    enable,
    retryCatalogs: choices.retryCatalogs,
    refresh: () => setReload((value) => value + 1),
  };
}
