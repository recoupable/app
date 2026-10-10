"use client";
import dynamic from "next/dynamic";
import type { useReleaseStreams } from "@/hooks/useReleaseStreams";
import type { buildReleaseStreamSeries } from "@/lib/releases/buildReleaseStreamSeries";
import ReleaseStreamSummary from "./ReleaseStreamSummary";
import ReleaseStreamTracking from "./ReleaseStreamTracking";
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
  if (!series || !data.history) return <ReleaseStreamTracking data={data} />;
  return (
    <>
      <ReleaseStreamSummary series={series} days={data.days} />
      {series.daily.some((point) => point.streams !== null) ? (
        <Chart points={series.daily} />
      ) : (
        <p role="status" className="rounded-lg bg-muted p-4 text-sm">
          No daily streams available yet.
        </p>
      )}
      {series.missingDays > 0 && (
        <p className="text-xs text-muted-foreground">
          {series.missingDays} of {data.days} days unavailable. Totals require
          complete history.
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>Worldwide · All DSPs</span>
        <ReleaseStreamTracking data={data} />
      </div>
      <details className="text-xs text-muted-foreground">
        <summary className="w-fit cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Data details
        </summary>
        <div className="mt-3 space-y-2 rounded-lg bg-muted/50 p-3 leading-relaxed">
          <p>
            Luminate · {data.history.periods.current.start} –{" "}
            {series.daily.at(-1)?.date} (UTC). Compared with the previous{" "}
            {data.days} days.
          </p>
          <p>
            {series.matchedTracks} of {series.uniqueTracks} release recordings
            matched. Repeated ISRCs count once; missing days are not counted as
            zero.
          </p>
          {series.unknownIdentity && (
            <p>Release identity or track coverage is incomplete.</p>
          )}
          {series.latestCollected && (
            <p>
              Collected{" "}
              {new Date(series.latestCollected).toLocaleString("en-US", {
                timeZone: "UTC",
              })}{" "}
              UTC. Two-day reporting buffer.
            </p>
          )}
        </div>
      </details>
    </>
  );
}
