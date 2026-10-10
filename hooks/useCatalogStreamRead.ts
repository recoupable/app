"use client";
import { useEffect, useState } from "react";
import { getReleaseStreamHistory } from "@/lib/releases/getReleaseStreamHistory";
import { getStreamPeriod } from "@/lib/releases/getStreamPeriod";
import { requestStreamData } from "@/lib/releases/requestStreamData";
import {
  streamTrackingSchema,
  type StreamHistory,
  type StreamTracking,
} from "@/lib/releases/streamTypes";
/** Saved history only; bounded polling never starts provider collection. */
export function useCatalogStreamRead(
  catalogId: string,
  days: number,
  reload: number,
  getAccessToken: () => Promise<string | null>,
) {
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
    if (!catalogId) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    let collecting = false;
    const load = async () => {
      if (++attempts > 30 || controller.signal.aborted) return;
      if (attempts > 1 && document.hidden) {
        timer = setTimeout(load, 10000);
        return;
      }
      try {
        const [history, tracking] = await Promise.all([
          getReleaseStreamHistory(
            catalogId,
            getStreamPeriod(days),
            getAccessToken,
            controller.signal,
          ),
          requestStreamData(
            `catalogs/${encodeURIComponent(catalogId)}/stream-tracking`,
            getAccessToken,
            controller.signal,
          ).then((result) => streamTrackingSchema.parse(result)),
        ]);
        if (tracking.catalog_id !== catalogId)
          throw new Error("Unexpected catalog response");
        if (controller.signal.aborted) return;
        setRead({ key, history, tracking, error: "", loading: false });
        collecting = ["queued", "running"].includes(
          tracking.latest_run?.status ?? "",
        );
        if (collecting) timer = setTimeout(load, 10000);
      } catch (error) {
        if (controller.signal.aborted) return;
        const retryable =
          collecting &&
          error instanceof Error &&
          error.message === "Could not load streams. Please retry.";
        setRead((previous) => ({
          key,
          history: retryable && previous.key === key ? previous.history : null,
          tracking:
            retryable && previous.key === key ? previous.tracking : null,
          error:
            error instanceof Error && error.name !== "ZodError"
              ? error.message
              : "Could not load streams. Please retry.",
          loading: false,
        }));
        if (retryable) timer = setTimeout(load, 20000);
      }
    };
    void load();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [catalogId, days, key, getAccessToken]);
  return visible;
}
