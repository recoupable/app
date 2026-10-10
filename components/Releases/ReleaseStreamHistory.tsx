"use client";
import dynamic from "next/dynamic";
import type { useReleaseStreams } from "@/hooks/useReleaseStreams";
import type { buildReleaseStreamSeries } from "@/lib/releases/buildReleaseStreamSeries";
import ReleaseStreamSummary from "./ReleaseStreamSummary";
const Chart = dynamic(() => import("./ReleaseStreamChart"), {
  ssr: false,
  loading: () => <p role="status">Loading chart…</p>,
});
export default function ReleaseStreamHistory({
  data,
  series,
}: {
  data: ReturnType<typeof useReleaseStreams>;
  series: ReturnType<typeof buildReleaseStreamSeries> | null;
}) {
  return (
    <>
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
            {series.selectedIsrc ? "Release catalog coverage: " : ""}
            {series.matchedTracks} of {series.uniqueTracks} identified
            recordings in this catalog
            {series.unknownIdentity
              ? " · Release identity or track coverage is incomplete"
              : ""}
            .
            {!series.selectedIsrc &&
              " Duplicate ISRCs count once in the release total."}
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
    </>
  );
}
