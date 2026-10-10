"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { useReleaseStreams } from "@/hooks/useReleaseStreams";
import type { buildReleaseStreamSeries } from "@/lib/releases/buildReleaseStreamSeries";
import ReleaseStreamSummary from "./ReleaseStreamSummary";
import ReleaseStreamTracking from "./ReleaseStreamTracking";
import ReleaseStreamDailyValues from "./ReleaseStreamDailyValues";
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
  const [view, setView] = useState("chart");
  if (!series || !data.history) return <ReleaseStreamTracking data={data} />;
  const observed = series.daily.filter((p) => p.streams !== null).at(-1)?.date;
  return (
    <>
      <ReleaseStreamSummary
        series={series}
        days={data.days}
        since={data.since}
      />
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          Worldwide · All DSPs
          {observed
            ? ` · Data through ${new Date(`${observed}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}`
            : ""}
        </span>
        <div role="group" aria-label="Performance view" className="flex gap-1">
          {["chart", "table"].map((mode) => (
            <button
              type="button"
              key={mode}
              aria-pressed={view === mode}
              onClick={() => setView(mode)}
              className={`rounded-md px-2 py-1 capitalize focus-visible:ring-2 focus-visible:ring-ring ${view === mode ? "bg-muted text-foreground" : "hover:text-foreground"}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      {view === "table" ? (
        <ReleaseStreamDailyValues points={series.daily} />
      ) : series.daily.some((p) => p.streams !== null) ? (
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
      <div className="flex justify-end">
        <ReleaseStreamTracking data={data} />
      </div>
    </>
  );
}
