import type {
  UsageSeriesBucket,
  UsageSeriesPoint,
} from "@/lib/recoup/getAccountUsage";
import fillSeriesGaps from "@/lib/usage/fillSeriesGaps";
import formatBucketLabel from "@/lib/usage/formatBucketLabel";

interface UsageChartProps {
  series: UsageSeriesPoint[];
  bucket: UsageSeriesBucket;
  period: { from: string; to: string };
}

const HEIGHT = 120;

/** Spend per bucket across the period as bars; every amount is the api's USD string. */
const UsageChart = ({ series, bucket, period }: UsageChartProps) => {
  const points = fillSeriesGaps(series, bucket, period.from, period.to);
  const max = Math.max(1, ...points.map((point) => point.credits_deducted));
  const labelEvery = Math.max(1, Math.ceil(points.length / 8));
  return (
    <div className="mb-6 rounded-2xl bg-card p-4 sm:p-6 shadow-[0_0_0_1px_var(--border)]">
      <div
        className="flex h-[120px] items-end gap-px sm:gap-0.5"
        role="img"
        aria-label="Spend over time"
      >
        {points.map((point) => (
          <div
            key={point.start}
            data-bar
            title={`${formatBucketLabel(point.start, bucket)}: ${point.usd}, ${point.events} events`}
            className="flex-1 rounded-t-sm bg-foreground/80 transition-[height] hover:bg-foreground"
            style={{
              height: `${Math.max(2, (point.credits_deducted / max) * HEIGHT)}px`,
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex text-[11px] text-muted-foreground">
        {points.map((point, index) => (
          <span key={point.start} className="flex-1 truncate">
            {index % labelEvery === 0
              ? formatBucketLabel(point.start, bucket)
              : ""}
          </span>
        ))}
      </div>
    </div>
  );
};

export default UsageChart;
