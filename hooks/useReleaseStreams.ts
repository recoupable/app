"use client";
import { useEffect, useRef, useState } from "react";
import { getReleaseStreamCatalogs } from "@/lib/releases/getReleaseStreamCatalogs";
import { getReleaseStreamHistory } from "@/lib/releases/getReleaseStreamHistory";
import { getStreamPeriod } from "@/lib/releases/getStreamPeriod";
import { requestStreamData } from "@/lib/releases/requestStreamData";
import {
  streamTrackingSchema,
  type StreamHistory,
  type StreamTracking,
} from "@/lib/releases/streamTypes";

/** The parent keys this hook's component by account, workspace, release and evidence fingerprint. */
export function useReleaseStreams(
  accountId: string,
  getAccessToken: () => Promise<string | null>,
) {
  const tokenReader = useRef(getAccessToken);
  useEffect(() => {
    tokenReader.current = getAccessToken;
  }, [getAccessToken]);
  const [catalogs, setCatalogs] = useState<{ id: string; name: string }[]>([]);
  const [catalogId, setCatalogId] = useState("");
  const [days, setDays] = useState(28);
  const [reload, setReload] = useState(0);
  const [catalogError, setCatalogError] = useState("");
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [catalogReload, setCatalogReload] = useState(0);
  const [enabling, setEnabling] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const lifetime = useRef<AbortController | null>(null);
  const [read, setRead] = useState<{
    key: string;
    history: StreamHistory | null;
    tracking: StreamTracking | null;
    error: string;
    loading: boolean;
  }>({ key: "", history: null, tracking: null, error: "", loading: false });
  const key = JSON.stringify([catalogId, days, reload]);
  const visible =
    read.key === key
      ? read
      : { history: null, tracking: null, error: "", loading: !!catalogId };
  useEffect(() => {
    const controller = new AbortController();
    lifetime.current = controller;
    void getReleaseStreamCatalogs(
      accountId,
      () => tokenReader.current(),
      controller.signal,
    )
      .then((items) => {
        if (controller.signal.aborted) return;
        setCatalogs(items);
        if (items.length === 1) setCatalogId(items[0].id);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setCatalogError("Could not load workspace catalogs. Please retry.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setCatalogsLoading(false);
      });
    return () => controller.abort();
  }, [accountId, catalogReload]);
  useEffect(() => {
    if (!catalogId) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      try {
        const [history, tracking] = await Promise.all([
          getReleaseStreamHistory(
            catalogId,
            getStreamPeriod(days),
            () => tokenReader.current(),
            controller.signal,
          ),
          requestStreamData(
            `catalogs/${encodeURIComponent(catalogId)}/stream-tracking`,
            () => tokenReader.current(),
            controller.signal,
          ).then((result) => streamTrackingSchema.parse(result)),
        ]);
        if (tracking.catalog_id !== catalogId)
          throw new Error("Unexpected catalog response");
        if (controller.signal.aborted) return;
        setRead({ key, history, tracking, error: "", loading: false });
        if (["queued", "running"].includes(tracking.latest_run?.status ?? ""))
          timer = setTimeout(load, 10000);
      } catch (error) {
        if (!controller.signal.aborted)
          setRead({
            key,
            history: null,
            tracking: null,
            error:
              error instanceof Error && !(error.name === "ZodError")
                ? error.message
                : "Could not load streams. Please retry.",
            loading: false,
          });
      }
    };
    void load();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [catalogId, days, key]);
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
    catalogs,
    catalogId,
    selectCatalog,
    days,
    setDays,
    catalogsLoading,
    catalogError,
    ...visible,
    enabling,
    mutationError,
    enable,
    retryCatalogs: () => {
      setCatalogError("");
      setCatalogsLoading(true);
      setCatalogReload((value) => value + 1);
    },
    refresh: () => setReload((value) => value + 1),
  };
}
