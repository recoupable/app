"use client";

import Link from "next/link";
import { useConfirmFirstTask } from "@/hooks/useConfirmFirstTask";
import { getFirstTaskSchedule } from "@/lib/onboarding/getFirstTaskSchedule";
import { getCronHumanPreview } from "@/lib/tasks/getCronHumanPreview";
import { getTaskNextRun } from "@/lib/tasks/getTaskNextRun";
import { formatScheduledActionDate } from "@/lib/utils/formatScheduledActionDate";

interface FirstTaskConfirmProps {
  catalogName?: string;
}

/**
 * The one question after the pre-run report (chat#1867): "get this every
 * Monday?" Confirm creates the enabled weekly task; decline creates
 * nothing. Success shows the next-run time from the created row.
 */
const FirstTaskConfirm = ({ catalogName }: FirstTaskConfirmProps) => {
  const { confirm, decline, phase, task } = useConfirmFirstTask({
    catalogName,
  });

  if (phase === "declined") {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        No task created. You can set up a weekly report anytime from{" "}
        <Link href="/tasks" className="underline hover:text-foreground">
          Tasks
        </Link>
        .
      </p>
    );
  }

  if (phase === "scheduled") {
    const nextRunAt = task ? getTaskNextRun(task) : null;
    const nextRun = nextRunAt
      ? formatScheduledActionDate(nextRunAt)
      : getCronHumanPreview(getFirstTaskSchedule());
    return (
      <div role="status">
        <p className="text-sm font-medium text-foreground">
          Weekly report scheduled.
        </p>
        <p className="text-sm text-muted-foreground">
          Next run: {nextRun}.{" "}
          <Link href="/tasks" className="underline hover:text-foreground">
            View your tasks
          </Link>
        </p>
      </div>
    );
  }

  const isCreating = phase === "creating";
  return (
    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <p className="text-sm font-medium text-foreground">
          Get this every Monday?
        </p>
        <p className="text-xs text-muted-foreground">
          We&apos;ll run this report every Monday at 9am as a scheduled task.
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={decline}
          disabled={isCreating}
          className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={isCreating}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCreating ? "Scheduling..." : "Yes, every Monday"}
        </button>
      </div>
    </div>
  );
};

export default FirstTaskConfirm;
