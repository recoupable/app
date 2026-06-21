import React from "react";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";
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

export default function YouTubeRevenueStats({
  revenueData,
}: YouTubeRevenueStatsProps) {
  const days = revenueData.dailyRevenue;
  const highestRevenueDay = days.reduce(
    (max, day) => (day.revenue > max.revenue ? day : max),
    days[0],
  );
  const dailyAverage = days.length
    ? revenueData.totalRevenue / days.length
    : 0;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Total revenue — headline */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <DollarSign className="size-4" />
          <span className="text-xs font-medium">Total revenue</span>
        </div>
        <p className="mt-1.5 text-2xl font-semibold tabular-nums text-foreground">
          {formatCurrency(revenueData.totalRevenue)}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">Past 30 days</p>
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
