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
  return (
    <div>
      <h4 className="text-sm font-medium mb-3">Recent daily revenue</h4>
      <div className="space-y-2">
        {dailyRevenue.slice(-7).map((day) => (
          <div
            key={day.date}
            className="flex items-center justify-between p-2 bg-muted/30 rounded"
          >
            <span className="text-sm">{formatDate(day.date)}</span>
            <span className="text-sm font-medium">
              {formatCurrency(day.revenue)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
