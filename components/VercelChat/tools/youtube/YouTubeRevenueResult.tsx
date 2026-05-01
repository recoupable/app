import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar } from "lucide-react";
import YouTubeRevenueError from "./YouTubeRevenueError";
import YouTubeRevenueStats from "./YouTubeRevenueStats";
import YouTubeRevenueDaily from "./YouTubeRevenueDaily";
import { formatDate } from "@/lib/utils/formatDate";

export interface YouTubeRevenueResult {
  success: boolean;
  status: string;
  message?: string;
  revenueData?: {
    totalRevenue: number;
    dailyRevenue: Array<{
      date: string;
      revenue: number;
    }>;
    dateRange: {
      startDate: string;
      endDate: string;
    };
    channelId: string;
    isMonetized: boolean;
  };
}

interface YouTubeRevenueResultProps {
  result: YouTubeRevenueResult;
}

export default function YouTubeRevenueResult({
  result,
}: YouTubeRevenueResultProps) {
  // Handle error states
  if (!result.success) {
    return (
      <YouTubeRevenueError
        message={result.message || "An error occurred while fetching revenue."}
      />
    );
  }

  // Handle successful revenue data
  const { revenueData } = result;

  if (!revenueData) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>YouTube Revenue Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No revenue data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>YouTube Revenue Analytics</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={revenueData.isMonetized ? "default" : "secondary"}>
              {revenueData.isMonetized ? "Monetized" : "Not Monetized"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <YouTubeRevenueStats revenueData={revenueData} />

        {/* Date Range */}
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(revenueData.dateRange.startDate)} -{" "}
              {formatDate(revenueData.dateRange.endDate)}
            </span>
          </div>
          <span className="text-xs">
            Channel ID: {revenueData.channelId.slice(0, 8)}...
          </span>
        </div>

        {/* Recent Daily Revenue */}
        <YouTubeRevenueDaily dailyRevenue={revenueData.dailyRevenue} />

        {/* Footer Note */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p>
            💡 Revenue data is estimated and provided by YouTube Analytics.
            Actual payments may vary based on YouTube&apos;s payment schedule
            and policies.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
