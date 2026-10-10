import type { buildReleaseStreamSeries } from "@/lib/releases/buildReleaseStreamSeries";
const number = (value: number | null) =>
  value?.toLocaleString("en-US") ?? "Unavailable";
export default function ReleaseStreamSummary({
  series,
  days,
}: {
  series: ReturnType<typeof buildReleaseStreamSeries>;
  days: number;
}) {
  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <dt className="text-sm text-muted-foreground">Last {days} days</dt>
        <dd className="mt-1 text-2xl font-semibold tabular-nums">
          {number(series.total)}
        </dd>
      </div>
      <div>
        <dt className="text-sm text-muted-foreground">Previous {days} days</dt>
        <dd className="mt-1 text-2xl font-semibold tabular-nums">
          {number(series.previous)}
        </dd>
      </div>
      <div>
        <dt className="text-sm text-muted-foreground">Change</dt>
        <dd className="mt-1 text-2xl font-semibold tabular-nums">
          {series.growth != null
            ? `${series.growth > 0 ? "+" : ""}${number(series.growth)}`
            : "Unavailable"}
        </dd>
        <dd className="text-xs text-muted-foreground">
          {series.percentage != null
            ? `${series.percentage > 0 ? "+" : ""}${series.percentage.toFixed(1)}%`
            : series.previous === 0 && series.total != null
              ? "No percentage from a zero baseline"
              : "Complete periods required"}
        </dd>
      </div>
    </dl>
  );
}
