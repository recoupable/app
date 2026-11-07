"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useArtistProvider } from "@/providers/ArtistProvider";
import useCatalogs from "@/hooks/useCatalogs";
import { useNewChatBootstrap } from "@/hooks/useNewChatBootstrap";
import { useScheduledActions } from "@/hooks/useScheduledActions";
import { buildFirstTaskPrompt } from "@/lib/onboarding/buildFirstTaskPrompt";
import { findExistingWeeklyReportTask } from "@/lib/onboarding/findExistingWeeklyReportTask";
import type { Task } from "@/lib/tasks/getTasks";
import ExistingWeeklyReportPanel from "./ExistingWeeklyReportPanel";
import FirstTaskReportRun from "./FirstTaskReportRun";
import SetupSkipLink from "./SetupSkipLink";

/**
 * Final step of the canonical `/setup/*` sequence (chat#1867, chat#1889),
 * mounted by `/setup/tasks`: pre-run the first monthly catalog report, show it
 * finished, then schedule it monthly without a click (recoupable/app#1941).
 * Self-contained — provisions its own chat session (the same infrastructure a
 * normal send uses).
 *
 * Carries the gate's "skip for now" escape hatch, since home forwards
 * incomplete accounts into the sequence.
 */
const FirstTaskStep = () => {
  const { selectedArtist, isLoading: isArtistsLoading } = useArtistProvider();
  const catalogsQuery = useCatalogs();
  const tasksQuery = useScheduledActions({});
  const bootstrap = useNewChatBootstrap();
  const { user, ready } = usePrivy();
  const artistName = selectedArtist?.name;
  const artistAccountId = selectedArtist?.account_id;
  // The monthly report is emailed to the account holder — same address the
  // scheduled task uses (useConfirmFirstTask), so the preview matches the send.
  const recipientEmail = user?.email?.address;

  // Wait for catalogs so the pre-run prompt names the claimed catalog —
  // and therefore matches the scheduled task's prompt byte-for-byte.
  const isPreparing =
    isArtistsLoading || catalogsQuery.isLoading || bootstrap.status !== "ready";
  const catalogName = catalogsQuery.data?.catalogs?.[0]?.name;

  // Never pre-run + re-schedule over an existing schedule (chat#1889): a return
  // visit (or a re-click of the welcome email's step link) billed a duplicate
  // run and left a second schedule behind. Wait for the read before deciding, so
  // the pre-run isn't kicked off while tasks are still loading. Decide once, on
  // arrival: the task this step creates itself must not swap the finished
  // report for the "already set up" panel when the tasks list refetches.
  // Only a successful read counts: before sign-in resolves the query is
  // disabled (not loading, no data), and deciding then would miss a schedule.
  const [entryTask, setEntryTask] = useState<Task | null | undefined>();
  if (entryTask === undefined && tasksQuery.isSuccess) {
    setEntryTask(findExistingWeeklyReportTask(tasksQuery.data));
  }
  const existingTask = entryTask ?? null;
  if (entryTask === undefined && tasksQuery.isError) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-3 px-4 py-8">
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
      </div>
    );
  }
  if (entryTask === undefined) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
        <p
          className="animate-pulse text-sm text-muted-foreground"
          role="status"
        >
          Checking your reports...
        </p>
      </div>
    );
  }
  if (existingTask) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
        <ExistingWeeklyReportPanel task={existingTask} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
      <header>
        <h1 className="text-xl font-semibold text-foreground">
          Your first monthly report
        </h1>
        <p className="text-sm text-muted-foreground">
          {artistName
            ? `Your catalog report for ${artistName}. Recoup will email you an update like this every month.`
            : "Recoup will email you an update like this every month."}
        </p>
      </header>
      {!isArtistsLoading && !artistName ? (
        <p className="text-sm text-muted-foreground" role="status">
          Select an artist to generate your first report.
        </p>
      ) : bootstrap.status === "error" ? (
        <p className="text-sm text-destructive" role="alert">
          {bootstrap.message}
        </p>
      ) : ready && artistName && artistAccountId && !recipientEmail ? (
        // Distinct from "loading": a wallet/phone/social-only Privy login has no
        // email to deliver the report to — retrying never resolves it.
        <p className="text-sm text-destructive" role="alert">
          Add an email address to your account to receive your monthly report.
        </p>
      ) : isPreparing ||
        bootstrap.status !== "ready" ||
        !artistName ||
        !artistAccountId ||
        !recipientEmail ? (
        <p
          className="animate-pulse text-sm text-muted-foreground"
          role="status"
        >
          Preparing your workspace...
        </p>
      ) : (
        <FirstTaskReportRun
          // Re-key per provisioned chat: an artist switch mints a fresh
          // session, and the remount re-arms the one-shot auto-send.
          key={bootstrap.chatId}
          sessionId={bootstrap.sessionId}
          chatId={bootstrap.chatId}
          prompt={buildFirstTaskPrompt({
            artistName,
            artistAccountId,
            recipientEmail,
            catalogName,
          })}
          catalogName={catalogName}
          // One automatic schedule per account: once any report is active
          // (say, created a moment ago for another artist), ask instead.
          autoCreate={!tasksQuery.data?.some((task) => task.enabled === true)}
        />
      )}
      <SetupSkipLink />
    </div>
  );
};

export default FirstTaskStep;
