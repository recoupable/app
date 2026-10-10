"use client";
import { useEffect, useState } from "react";
import { getReleaseStreamCatalogs } from "@/lib/releases/getReleaseStreamCatalogs";
/** Select only catalogs attributed to this workspace through the viewer. */
export function useReleaseStreamCatalogChoices(
  accountId: string,
  organizationId: string | null,
  getAccessToken: () => Promise<string | null>,
  selectCatalog: (id: string) => void,
) {
  const [catalogs, setCatalogs] = useState<{ id: string; name: string }[]>([]);
  const [catalogError, setCatalogError] = useState("");
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [catalogReload, setCatalogReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void getReleaseStreamCatalogs(
      accountId,
      getAccessToken,
      controller.signal,
      organizationId,
    )
      .then((items) => {
        if (controller.signal.aborted) return;
        setCatalogs(items);
        if (items.length === 1) selectCatalog(items[0].id);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setCatalogError("Could not load workspace catalogs. Please retry.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setCatalogsLoading(false);
      });
    return () => controller.abort();
  }, [accountId, organizationId, catalogReload, getAccessToken, selectCatalog]);
  return {
    catalogs,
    catalogError,
    catalogsLoading,
    retryCatalogs: () => {
      setCatalogError("");
      setCatalogsLoading(true);
      setCatalogReload((value) => value + 1);
    },
  };
}
