import React from "react";
import { DollarSign, Calendar, BarChart3 } from "lucide-react";
import { ToolCard, ToolCardBody } from "../shared/ToolCard";
import { ToolEmpty } from "../shared/ToolEmpty";
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

  const { revenueData } = result;

  // No data returned
  if (!revenueData) {
    return (
      <ToolCard
        icon={DollarSign}
        tone="neutral"
        title="YouTube revenue"
        subtitle="Analytics"
        className="max-w-2xl"
      >
        <ToolCardBody>
          <ToolEmpty
            icon={BarChart3}
            title="No revenue data available"
            description="There's nothing to report for this period yet."
          />
        </ToolCardBody>
      </ToolCard>
    );
  }

  return (
    <ToolCard
      icon={DollarSign}
      tone={revenueData.isMonetized ? "success" : "neutral"}
      title="YouTube revenue"
      subtitle="Analytics • estimated"
      className="max-w-2xl"
      trailing={
        <span
          className={
            revenueData.isMonetized
              ? "rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
              : "rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
          }
        >
          {revenueData.isMonetized ? "Monetized" : "Not monetized"}
        </span>
      }
    >
      <ToolCardBody className="space-y-5">
        {/* Summary stats */}
        <YouTubeRevenueStats revenueData={revenueData} />

        {/* Date range */}
        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {formatDate(revenueData.dateRange.startDate)} –{" "}
            {formatDate(revenueData.dateRange.endDate)}
          </span>
          {revenueData.channelId ? (
            <span title={`Channel ID: ${revenueData.channelId}`}>
              Channel ID {revenueData.channelId.slice(0, 8)}…
            </span>
          ) : null}
        </div>

        {/* Daily breakdown */}
        <YouTubeRevenueDaily dailyRevenue={revenueData.dailyRevenue} />

        {/* Footer note */}
        <p className="rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
          Revenue is estimated by YouTube Analytics. Actual payments may vary
          based on YouTube&apos;s payment schedule and policies.
        </p>
      </ToolCardBody>
    </ToolCard>
  );
}
