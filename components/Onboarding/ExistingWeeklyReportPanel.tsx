"use client";

import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/tasks/getTasks";

/**
 * Shown at `/setup/tasks` when the account already has an enabled schedule
 * (chat#1889): the step used to pre-run a fresh report and schedule again on
 * every visit, which billed a duplicate run and left a second schedule behind.
 * Surfaces the existing schedule and its most recent run instead.
 */
const ExistingWeeklyReportPanel = ({ task }: { task: Task }) => {
  const latestRun = task.recent_runs?.[0];
  const nextRun = task.upcoming?.[0];

  return (
    <section className="flex flex-col items-center gap-4 py-8 text-center">
      <CalendarClock className="size-10 text-muted-foreground" />
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Your weekly report is already set up
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {nextRun
            ? `Next run ${new Date(nextRun).toLocaleString()}.`
            : "It runs on its schedule and emails you the result."}
          {latestRun?.createdAt
            ? ` Last run ${new Date(latestRun.createdAt).toLocaleString()}.`
            : " No runs yet."}
        </p>
      </div>
      <Link
        href="/tasks"
        className={cn(buttonVariants(), "min-w-[200px]")}
      >
        View your reports
      </Link>
    </section>
  );
};

export default ExistingWeeklyReportPanel;
