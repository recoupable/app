import React from "react";
import { formatDate } from "@/lib/utils/formatDate";
import { formatCurrency } from "@/lib/utils/formatCurrency";

interface DailyRevenueItem {
  date: string;
  revenue: number;
}

interface YouTubeDailyRevenueProps {
  dailyRevenue: DailyRevenueItem[];
}

export default function YouTubeRevenueDaily({
  dailyRevenue,
}: YouTubeDailyRevenueProps) {
  const recent = dailyRevenue.slice(-7);
  const max = recent.reduce((m, d) => Math.max(m, d.revenue), 0);

  return (
    <div>
      <h4 className="mb-3 text-sm font-medium text-foreground">
        Recent daily revenue
        <span className="ml-1.5 font-normal text-muted-foreground">
          (last 7 days)
        </span>
      </h4>
      <div className="space-y-1.5">
        {recent.map((day) => {
          const pct = max > 0 ? Math.max((day.revenue / max) * 100, 2) : 0;
          return (
            <div key={day.date} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs text-muted-foreground">
                {formatDate(day.date)}
              </span>
              <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-muted/50">
                <div
                  className="absolute inset-y-0 left-0 rounded-md bg-emerald-500/25"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-xs font-medium tabular-nums text-foreground">
                {formatCurrency(day.revenue)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
