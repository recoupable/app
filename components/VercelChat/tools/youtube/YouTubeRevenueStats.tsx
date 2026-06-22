"use client";

import React from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";
import {
  animate,
  useMotionValue,
  useReducedMotion,
  useTransform,
  motion,
} from "framer-motion";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDate } from "@/lib/utils/formatDate";

interface RevenueData {
  totalRevenue: number;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
  }>;
}

interface YouTubeRevenueStatsProps {
  revenueData: RevenueData;
}

/** Animated currency value that counts up from 0 on mount. */
function CountUpCurrency({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(reduceMotion ? value : 0);
  const formatted = useTransform(count, (v) => formatCurrency(v));

  React.useEffect(() => {
    if (reduceMotion) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [value, count, reduceMotion]);

  return <motion.span>{formatted}</motion.span>;
}

export default function YouTubeRevenueStats({
  revenueData,
}: YouTubeRevenueStatsProps) {
  const days = revenueData.dailyRevenue ?? [];
  const highestRevenueDay = days.length
    ? days.reduce(
        (max, day) => (day.revenue > max.revenue ? day : max),
        days[0],
      )
    : undefined;
  const dailyAverage = days.length
    ? revenueData.totalRevenue / days.length
    : 0;

  // Period-over-period delta: compare the most recent half of the range to the
  // prior half when there's enough data to make the comparison meaningful.
  const delta = (() => {
    if (days.length < 4) return null;
    const mid = Math.floor(days.length / 2);
    const prior = days.slice(0, mid).reduce((s, d) => s + d.revenue, 0);
    const recent = days.slice(mid).reduce((s, d) => s + d.revenue, 0);
    if (prior <= 0) return null;
    return ((recent - prior) / prior) * 100;
  })();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Total revenue — headline */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="size-4" />
            <span className="text-xs font-medium">Total revenue</span>
          </div>
          {delta !== null && (
            <span
              className={
                delta >= 0
                  ? "inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400"
                  : "inline-flex items-center gap-0.5 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-destructive"
              }
              title="vs. prior period in this range"
            >
              {delta >= 0 ? (
                <TrendingUp className="size-2.5" />
              ) : (
                <TrendingDown className="size-2.5" />
              )}
              {Math.abs(delta).toFixed(0)}%
            </span>
          )}
        </div>
        <p className="mt-1.5 text-2xl font-semibold tabular-nums text-foreground">
          <CountUpCurrency value={revenueData.totalRevenue} />
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Past {days.length} {days.length === 1 ? "day" : "days"}
        </p>
      </div>

      {/* Best day */}
      <div className="rounded-xl border border-border bg-muted/40 p-4">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <TrendingUp className="size-4" />
          <span className="text-xs font-medium">Best day</span>
        </div>
        <p className="mt-1.5 text-xl font-semibold tabular-nums text-foreground">
          {highestRevenueDay
            ? formatCurrency(highestRevenueDay.revenue)
            : "—"}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {highestRevenueDay ? formatDate(highestRevenueDay.date) : "No data"}
        </p>
      </div>

      {/* Daily average */}
      <div className="rounded-xl border border-border bg-muted/40 p-4">
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
          <Calendar className="size-4" />
          <span className="text-xs font-medium">Daily average</span>
        </div>
        <p className="mt-1.5 text-xl font-semibold tabular-nums text-foreground">
          {formatCurrency(dailyAverage)}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {days.length} days
        </p>
      </div>
    </div>
  );
}
