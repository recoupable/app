"use client";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import type { useReleaseStreams } from "@/hooks/useReleaseStreams";
import { buildReleaseStreamSeries } from "@/lib/releases/buildReleaseStreamSeries";
import type { ReleaseCase } from "@/lib/releases/types";
import ReleaseStreamSummary from "./ReleaseStreamSummary";
const Chart = dynamic(() => import("./ReleaseStreamChart"), {
  ssr: false,
  loading: () => <p role="status">Loading chart…</p>,
});
const selectClass =
  "h-11 sm:h-10 max-w-full rounded-lg bg-background px-3 text-sm shadow-[0_0_0_1px_var(--input)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
interface Props {
  current: ReleaseCase;
  data: ReturnType<typeof useReleaseStreams>;
}

export default function ReleaseStreamPanel({ current, data }: Props) {
  const [selectedIsrc, setSelectedIsrc] = useState("");
  const series = useMemo(
    () =>
      data.history
        ? buildReleaseStreamSeries(
            current,
            data.history,
            selectedIsrc || undefined,
          )
        : null,
    [current, data.history, selectedIsrc],
  );
  const collecting = ["queued", "running"].includes(
    data.tracking?.latest_run?.status ?? "",
  );
  return (
    <section
      className="space-y-5 rounded-xl bg-card p-4 sm:p-6 shadow-[0_0_0_1px_var(--border)]"
      aria-label="Release streams"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Streams</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Worldwide · All reporting DSPs · Luminate
          </p>
        </div>
        <Button
          variant="outline"
          disabled={data.loading || data.enabling || !data.catalogId}
          onClick={data.refresh}
        >
          Refresh streams
        </Button>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex min-w-0 flex-col gap-2 text-sm">
          Catalog
          <select
            aria-label="Stream catalog"
            className={selectClass}
            value={data.catalogId}
            disabled={data.catalogsLoading || data.enabling}
            onChange={(event) => data.selectCatalog(event.target.value)}
          >
            <option value="">Select catalog</option>
            {data.catalogs.map((catalog) => (
              <option key={catalog.id} value={catalog.id}>
                {catalog.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Period
          <select
            aria-label="Stream period"
            className={selectClass}
            value={data.days}
            onChange={(event) => data.setDays(Number(event.target.value))}
          >
            {[7, 28, 31].map((days) => (
              <option key={days} value={days}>
                Last {days} days
              </option>
            ))}
          </select>
        </label>
        {series && (
          <label className="flex min-w-0 flex-col gap-2 text-sm">
            Recording
            <select
              aria-label="Stream recording"
              className={selectClass}
              value={selectedIsrc}
              onChange={(event) => setSelectedIsrc(event.target.value)}
            >
              <option value="">Release total</option>
              {[
                ...new Map(
                  series.tracks
                    .filter((track) => track.isrc)
                    .map((track) => [track.isrc, track]),
                ).values(),
              ].map((track) => (
                <option key={track.isrc} value={track.isrc!}>
                  {track.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {data.catalogsLoading && <p role="status">Loading workspace catalogs…</p>}
      {data.catalogError && (
        <div>
          <p role="alert">{data.catalogError}</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={data.retryCatalogs}
          >
            Retry catalogs
          </Button>
        </div>
      )}
      {!data.catalogsLoading &&
        !data.catalogError &&
        data.catalogs.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Add these recordings to a workspace catalog to track daily streams.
          </p>
        )}
      {!data.catalogId && data.catalogs.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Choose the catalog containing this release’s recordings.
        </p>
      )}
      {data.loading && <p role="status">Loading saved streams…</p>}
      {data.error && <p role="alert">{data.error}</p>}
      {data.mutationError && <p role="alert">{data.mutationError}</p>}
      {data.tracking && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <p className="text-muted-foreground">
            {collecting
              ? "Collecting daily history…"
              : data.tracking.tracking?.enabled
                ? "Daily tracking on · 09:00 UTC"
                : "Daily tracking off"}
            {data.tracking.latest_run?.status === "failed"
              ? " · Last collection failed"
              : data.tracking.latest_run?.status === "partial"
                ? " · Last collection has gaps"
                : ""}
          </p>
          {!data.tracking.tracking?.enabled && (
            <Button
              size="sm"
              disabled={data.enabling}
              onClick={() => void data.enable()}
            >
              {data.enabling ? "Enabling…" : "Enable daily tracking"}
            </Button>
          )}
          {!data.tracking.tracking?.enabled && (
            <p className="text-xs text-muted-foreground">
              Enables daily collection for every recording in the selected
              catalog.
            </p>
          )}
        </div>
      )}
      {series && data.history && (
        <>
          <p className="text-sm text-muted-foreground">
            {data.history.periods.current.start} – {series.daily.at(-1)?.date}{" "}
            (UTC) · Compared with the preceding {data.days} days
          </p>
          <ReleaseStreamSummary series={series} days={data.days} />
          {series.daily.some((point) => point.streams !== null) ? (
            <Chart points={series.daily} />
          ) : (
            <p role="status" className="rounded-lg bg-muted p-4 text-sm">
              No complete daily values for this selection yet. Check catalog
              coverage and daily tracking.
            </p>
          )}
          {series.missingDays > 0 && (
            <p className="text-sm text-muted-foreground">
              {series.missingDays} of {data.days} days unavailable. Gaps are not
              counted as zero; totals require complete coverage.
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {series.matchedTracks} of {series.uniqueTracks} identified
            recordings in this catalog
            {series.unknownIdentity
              ? " · Release identity or track coverage is incomplete"
              : ""}
            . Duplicate ISRCs count once in the release total.
          </p>
          {series.latestCollected && (
            <p className="text-xs text-muted-foreground">
              Latest saved observation collected{" "}
              {new Date(series.latestCollected).toLocaleString("en-US", {
                timeZone: "UTC",
              })}{" "}
              UTC. Provider freshness is not supplied.
            </p>
          )}
        </>
      )}
      <p className="text-xs text-muted-foreground">
        Source-reported streams across DSPs, with a two-day reporting buffer.
      </p>
    </section>
  );
}
