"use client";

import { useEffect, useRef } from "react";
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
 * Shown once the pre-run report finishes (chat#1867). The monthly task is
 * created without a click — an account counts as onboarded only with a
 * recurring task (recoupable/app#1941) — and the old "get this every
 * Monday?" question becomes a way to turn it off.
 */
const FirstTaskConfirm = ({ catalogName }: FirstTaskConfirmProps) => {
  const { confirm, turnOff, phase, task, hasStarted, isTurningOff } =
    useConfirmFirstTask({ catalogName });

  // Strict Mode runs effects twice; the ref keeps it to one create.
  const startedRef = useRef(false);
  useEffect(() => {
    if (hasStarted || startedRef.current) return;
    startedRef.current = true;
    confirm();
  }, [hasStarted, confirm]);

  if (phase === "declined") {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Monthly report turned off. You can set it up again anytime from{" "}
        <Link href="/tasks" className="underline hover:text-foreground">
          Tasks
        </Link>
        .
      </p>
    );
  }

  if (phase === "failed") {
    return (
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-foreground" role="alert">
          We couldn&apos;t set up your monthly report.
        </p>
        <button
          type="button"
          onClick={confirm}
          className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          Try again
        </button>
      </div>
    );
  }

  if (phase === "scheduled") {
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
          onClick={turnOff}
          disabled={isTurningOff}
          className="shrink-0 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isTurningOff ? "Turning off..." : "Turn off"}
        </button>
      </div>
    );
  }

  return (
    <p className="animate-pulse text-sm text-muted-foreground" role="status">
      Setting up your monthly report...
    </p>
  );
};

export default FirstTaskConfirm;
