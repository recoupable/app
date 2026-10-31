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
  // Get the highest revenue day
  const highestRevenueDay = revenueData.dailyRevenue.reduce(
    (max, day) => (day.revenue > max.revenue ? day : max),
    revenueData.dailyRevenue[0],
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-600">
            Total Revenue
          </span>
        </div>
        <p className="text-2xl font-medium text-green-700 dark:text-green-500">
          {formatCurrency(revenueData.totalRevenue)}
        </p>
        <p className="text-xs text-green-600/80">Reported period</p>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Best Day</span>
        </div>
        <p className="text-xl font-medium text-blue-700 dark:text-blue-500">
          {formatCurrency(highestRevenueDay.revenue)}
        </p>
        <p className="text-xs text-blue-600/80">
          {formatDate(highestRevenueDay.date)}
        </p>
      </div>

      <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-600">
            Daily Average
          </span>
        </div>
        <p className="text-xl font-medium text-purple-700 dark:text-purple-500">
          {formatCurrency(
            revenueData.totalRevenue / revenueData.dailyRevenue.length,
          )}
        </p>
        <p className="text-xs text-purple-600/80">
          {revenueData.dailyRevenue.length} reported{" "}
          {revenueData.dailyRevenue.length === 1 ? "day" : "days"}
        </p>
      </div>
    </div>
  );
}
