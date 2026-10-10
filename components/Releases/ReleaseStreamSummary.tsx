import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { buildReleaseStreamSeries } from "@/lib/releases/buildReleaseStreamSeries";
const formatNumber = (value: number | null) =>
  value?.toLocaleString("en-US") ?? "Unavailable";
export default function ReleaseStreamSummary({
  series,
  days,
}: {
  series: ReturnType<typeof buildReleaseStreamSeries>;
  days: number;
}) {
  const Trend =
    series.growth === 0
      ? Minus
      : (series.growth ?? 0) > 0
        ? ArrowUpRight
        : ArrowDownRight;
  return (
    <dl className="flex flex-wrap items-end justify-between gap-6 py-2">
      <div>
        <dt className="text-xs text-muted-foreground">Last {days} days</dt>
        <dd
          className={`mt-2 font-medium tracking-[-0.045em] tabular-nums ${series.total === null ? "text-3xl" : "text-5xl sm:text-6xl"}`}
        >
          {formatNumber(series.total)}
        </dd>
      </div>
      <div className="pb-1 text-right">
        <dt className="sr-only">Change from previous {days} days</dt>
        <dd className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-sm font-medium tabular-nums">
          {series.percentage !== null ? (
            <>
              <Trend aria-hidden="true" className="size-4" />
              {series.percentage > 0 ? "+" : ""}
              {series.percentage.toFixed(1)}%
            </>
          ) : series.growth !== null ? (
            `${series.growth > 0 ? "+" : ""}${formatNumber(series.growth)} streams`
          ) : (
            "Unavailable"
          )}
        </dd>
        <dd className="mt-2 text-xs text-muted-foreground">
          {series.previous !== null ? (
            <>vs. {formatNumber(series.previous)} previous period</>
          ) : (
            "Incomplete history"
          )}
        </dd>
      </div>
    </dl>
  );
}
