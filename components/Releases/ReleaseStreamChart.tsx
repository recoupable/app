"use client";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { StreamPoint } from "@/lib/releases/streamTypes";
import ReleaseStreamDailyValues from "./ReleaseStreamDailyValues";
const config = { streams: { label: "Streams", color: "var(--foreground)" } };
const label = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

/** Linear daily observations: gaps stay disconnected and zero remains a real value. */
export default function ReleaseStreamChart({
  points,
}: {
  points: StreamPoint[];
}) {
  return (
    <div>
      <ChartContainer
        config={config}
        className="h-[240px] w-full"
        role="group"
        aria-label="Daily streams chart"
      >
        <LineChart
          data={points}
          margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
          accessibilityLayer
        >
          <CartesianGrid vertical={false} strokeOpacity={0.15} />
          <XAxis
            dataKey="date"
            tickFormatter={label}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis
            allowDecimals={false}
            domain={[0, "auto"]}
            axisLine={false}
            tickLine={false}
            width={45}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => (
                  <span className="tabular-nums">
                    {Number(value).toLocaleString("en-US")} streams
                  </span>
                )}
                labelFormatter={(_, payload) =>
                  label(String(payload?.[0]?.payload?.date ?? points[0]?.date))
                }
              />
            }
          />
          <Line
            type="linear"
            dataKey="streams"
            stroke="var(--color-streams)"
            strokeWidth={2}
            dot={{ r: 2 }}
            connectNulls={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
      <ReleaseStreamDailyValues points={points} />
    </div>
  );
}
