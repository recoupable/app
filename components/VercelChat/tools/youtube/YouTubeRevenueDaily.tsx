"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
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
  const reduceMotion = useReducedMotion();
  const recent = (dailyRevenue ?? []).slice(-7);
  const max = recent.reduce((m, d) => Math.max(m, d.revenue), 0);
  const bestRevenue = recent.length ? max : 0;

  return (
    <div>
      <h4 className="mb-3 text-sm font-medium text-foreground">
        Recent daily revenue
        <span className="ml-1.5 font-normal text-muted-foreground">
          (last 7 days)
        </span>
      </h4>
      <div className="space-y-1.5">
        {recent.map((day, i) => {
          const pct = max > 0 ? Math.max((day.revenue / max) * 100, 2) : 0;
          const isBest = bestRevenue > 0 && day.revenue === bestRevenue;
          return (
            <div key={day.date} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs text-muted-foreground">
                {formatDate(day.date)}
              </span>
              <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-muted/50">
                <motion.div
                  className={
                    isBest
                      ? "absolute inset-y-0 left-0 rounded-md bg-gradient-to-r from-emerald-500/40 to-emerald-500/60"
                      : "absolute inset-y-0 left-0 rounded-md bg-gradient-to-r from-emerald-500/30 to-emerald-500/45"
                  }
                  initial={reduceMotion ? false : { width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{
                    duration: 0.6,
                    delay: reduceMotion ? 0 : i * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
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
