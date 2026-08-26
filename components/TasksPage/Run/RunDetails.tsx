"use client";

import Link from "next/link";
import type { TaskRunStatus } from "@/lib/tasks/getTaskRunStatus";
import { getTaskDisplayName } from "@/lib/tasks/getTaskDisplayName";
import { getRunWorkflowLink } from "@/lib/tasks/getRunWorkflowLink";
import { getRunPageState } from "@/lib/tasks/getRunPageState";
import { useChatRunStatus } from "@/hooks/useChatRunStatus";
import { ERROR_STATUSES, STATUS_CONFIG, FALLBACK_CONFIG } from "./statusConfig";
import RunTimeline from "./RunTimeline";
import RunErrorDetails from "./RunErrorDetails";
import RunPageSkeleton from "./RunPageSkeleton";
import AccountIdDisplay from "@/components/ArtistSetting/AccountIdDisplay";

interface RunDetailsProps {
  runId: string;
  data: TaskRunStatus;
}

const openChatClass =
  "w-fit rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90";

/**
 * A scheduled run (chat#2006 item 4b). The Trigger.dev run only kicks the
 * work off; status and timeline come from the workflow run linked in its
 * metadata, and the transcript is the chat that run wrote to.
 */
export default function RunDetails({ runId, data }: RunDetailsProps) {
  const link = getRunWorkflowLink(data.metadata);
  const { data: workflow, isError } = useChatRunStatus(link?.workflowRunId);
  const state = getRunPageState({
    triggerRun: data,
    workflow,
    workflowFailed: isError,
  });
  const displayName = getTaskDisplayName(data.taskIdentifier);

  if (state.view === "loading") return <RunPageSkeleton />;

  const config =
    state.view === "unavailable"
      ? FALLBACK_CONFIG
      : (STATUS_CONFIG[state.statusKey] ?? FALLBACK_CONFIG);

  return (
    <div className="mx-auto flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        {config.icon}
        <div>
          <h1 className="text-lg font-semibold">{displayName}</h1>
          <p className={`text-sm ${config.color}`}>
            {state.view === "unavailable"
              ? "Workflow status unavailable"
              : config.label}
          </p>
        </div>
      </div>

      <RunTimeline
        createdAt={state.firedAt}
        startedAt={state.view === "unavailable" ? null : state.startedAt}
        finishedAt={state.view === "unavailable" ? null : state.finishedAt}
        durationMs={state.view === "unavailable" ? null : state.durationMs}
      />

      {state.view === "unlinked" ? (
        <p className="text-sm text-muted-foreground" role="status">
          No chat recorded for this run. It fired before run pages linked to
          their chats, so only the schedule status is available.
        </p>
      ) : (
        <Link href={state.chatHref} className={openChatClass}>
          Open chat
        </Link>
      )}

      {ERROR_STATUSES.has(data.status) && data.error && (
        <RunErrorDetails error={data.error} />
      )}

      <div className="text-xs text-muted-foreground">
        <AccountIdDisplay accountId={runId} label="Run" />
      </div>
    </div>
  );
}
