"use client";

import { useState } from "react";
import { useScheduledActions } from "@/hooks/useScheduledActions";
import { findExistingWeeklyReportTask } from "@/lib/onboarding/findExistingWeeklyReportTask";
import type { Task } from "@/lib/tasks/getTasks";
import ExistingWeeklyReportPanel from "./ExistingWeeklyReportPanel";
import FirstTaskReport from "./FirstTaskReport";
import SetupSkipLink from "./SetupSkipLink";

/**
 * Final step of the canonical `/setup/*` sequence (chat#1867, chat#1889),
 * mounted by `/setup/tasks`: pre-run the first monthly catalog report, show it
 * finished, then schedule it monthly without a click (recoupable/app#1941).
 *
 * Never pre-run + re-schedule over an existing schedule (chat#1889): a return
 * visit (or a re-click of the welcome email's step link) billed a duplicate
 * run and left a second schedule behind. Decide once, after a successful read
 * of the tasks list: before sign-in resolves the query is disabled (not
 * loading, no data), and the task this step creates itself must not swap the
 * finished report for the "already set up" panel when the list refetches.
 * A paused report counts, so "Turn off" sticks.
 *
 * Carries the gate's "skip for now" escape hatch, since home forwards
 * incomplete accounts into the sequence.
 */
const FirstTaskStep = () => {
  const tasksQuery = useScheduledActions({});
  const [entryTask, setEntryTask] = useState<Task | null | undefined>();
  if (entryTask === undefined && tasksQuery.isSuccess) {
    setEntryTask(
      findExistingWeeklyReportTask(tasksQuery.data, { includePaused: true }),
    );
  }

  if (entryTask === undefined) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-3 px-4 py-8">
        {tasksQuery.isError ? (
          <>
            <p className="text-sm text-destructive" role="alert">
              We couldn&apos;t check your reports.
            </p>
            <button
              type="button"
              onClick={() => tasksQuery.refetch()}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
            >
              Try again
            </button>
            <SetupSkipLink />
          </>
        ) : (
          <p
            className="animate-pulse text-sm text-muted-foreground"
            role="status"
          >
            Checking your reports...
          </p>
        )}
      </div>
    );
  }

  if (entryTask) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
        <ExistingWeeklyReportPanel task={entryTask} />
      </div>
    );
  }

  // One automatic schedule per account: once any report is active (say,
  // created a moment ago for another artist), ask instead.
  return (
    <FirstTaskReport
      autoCreate={!tasksQuery.data?.some((task) => task.enabled === true)}
    />
  );
};

export default FirstTaskStep;
