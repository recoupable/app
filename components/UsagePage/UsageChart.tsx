"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type {
  UsageSeriesBucket,
  UsageSeriesPoint,
} from "@/lib/recoup/getAccountUsage";
import fillSeriesGaps from "@/lib/usage/fillSeriesGaps";
import formatBucketLabel from "@/lib/usage/formatBucketLabel";
import { formatCreditsAsUsd } from "@/lib/credits/formatCreditsAsUsd";

interface UsageChartProps {
  series: UsageSeriesPoint[];
  bucket: UsageSeriesBucket;
  period: { from: string; to: string };
}

const config = {
  spend: { label: "Spend", color: "var(--foreground)" },
} satisfies ChartConfig;

/** Spend per bucket across the period as a shadcn bar chart; every amount shown is formatted currency. */
const UsageChart = ({ series, bucket, period }: UsageChartProps) => {
  const points = fillSeriesGaps(series, bucket, period.from, period.to);
  if (points.length === 0) return null;
  return (
    <div
      className="mb-6 rounded-2xl bg-card p-4 sm:p-6 shadow-[0_0_0_1px_var(--border)]"
      data-points={points.length}
    >
      <ChartContainer config={config} className="h-[160px] w-full">
        <BarChart
          data={points}
          margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
        >
          <CartesianGrid vertical={false} strokeOpacity={0.15} />
          <XAxis
            dataKey="start"
            tickLine={false}
            axisLine={false}
            minTickGap={24}
            tickFormatter={(start: string) => formatBucketLabel(start, bucket)}
          />
          <YAxis hide domain={[0, "dataMax"]} />
          <ChartTooltip
            cursor={{ fillOpacity: 0.08 }}
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) =>
                  formatBucketLabel(
                    String(payload?.[0]?.payload?.start ?? ""),
                    bucket,
                  )
                }
                formatter={(_, __, item) => {
                  const point = item?.payload as UsageSeriesPoint | undefined;
                  return point ? `${point.usd} · ${point.events} events` : null;
                }}
              />
            }
          />
          <Bar
            dataKey="credits_deducted"
            name="spend"
            fill="var(--color-spend)"
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
      <p className="sr-only">
        {points
          .map(
            (point) =>
              `${formatBucketLabel(point.start, bucket)}: ${formatCreditsAsUsd(point.credits_deducted)}`,
          )
          .join("; ")}
      </p>
    </div>
  );
};
export default UsageChart;
