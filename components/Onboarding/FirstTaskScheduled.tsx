"use client";

import Link from "next/link";
import type { Task } from "@/lib/tasks/getTasks";
import { getFirstTaskSchedule } from "@/lib/onboarding/getFirstTaskSchedule";
import { getCronHumanPreview } from "@/lib/tasks/getCronHumanPreview";
import { getTaskNextRun } from "@/lib/tasks/getTaskNextRun";
import { formatScheduledActionDate } from "@/lib/utils/formatScheduledActionDate";

interface FirstTaskScheduledProps {
  task?: Task;
  onTurnOff: () => void;
  isTurningOff: boolean;
}

/**
 * Confirms the automatically created monthly report with its next run, and
 * offers Turn off in place of the old opt-in question (recoupable/app#1941).
 */
const FirstTaskScheduled = ({
  task,
  onTurnOff,
  isTurningOff,
}: FirstTaskScheduledProps) => {
  const nextRunAt = task ? getTaskNextRun(task) : null;
  const nextRun = nextRunAt
    ? formatScheduledActionDate(nextRunAt)
    : getCronHumanPreview(getFirstTaskSchedule());

  return (
    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <div role="status">
        <p className="text-sm font-medium text-foreground">
          Your monthly report is set up.
        </p>
        <p className="text-sm text-muted-foreground">
          We&apos;ll email it to you once a month. Next run: {nextRun}.{" "}
          <Link href="/tasks" className="underline hover:text-foreground">
            View your tasks
          </Link>
        </p>
      </div>
      <button
        type="button"
        onClick={onTurnOff}
        disabled={isTurningOff}
        className="shrink-0 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isTurningOff ? "Turning off..." : "Turn off"}
      </button>
    </div>
  );
};

export default FirstTaskScheduled;
