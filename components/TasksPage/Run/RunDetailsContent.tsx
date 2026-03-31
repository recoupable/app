"use client";

import type { TaskRunStatus } from "@/lib/tasks/getTaskRunStatus";
import { ERROR_STATUSES } from "./statusConfig";
import RunLogsList from "./RunLogsList";
import RunTimeline from "./RunTimeline";
import RunOutput from "./RunOutput";
import RunErrorDetails from "./RunErrorDetails";
import AccountIdDisplay from "@/components/ArtistSetting/AccountIdDisplay";

export interface RunDetailsContentProps {
  runId: string;
  data: TaskRunStatus;
}

export default function RunDetailsContent({
  runId,
  data,
}: RunDetailsContentProps) {
  const logs = data.metadata?.logs ?? [];
  const currentStep = data.metadata?.currentStep;

  return (
    <>
      <RunTimeline
        createdAt={data.createdAt}
        startedAt={data.startedAt}
        finishedAt={data.finishedAt}
        durationMs={data.durationMs}
      />

      {currentStep && (
        <div className="rounded-md border bg-muted/30 px-4 py-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Current Step
          </p>
          <p className="text-sm font-medium">{currentStep}</p>
        </div>
      )}

      {data.status === "COMPLETED" && data.output !== undefined && (
        <RunOutput output={data.output} />
      )}

      <div className="flex-1 overflow-hidden">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Activity Log
        </p>
        <RunLogsList logs={logs as string[]} />
      </div>

      {ERROR_STATUSES.has(data.status) && data.error && (
        <RunErrorDetails error={data.error} />
      )}

      <div className="text-xs text-muted-foreground">
        <AccountIdDisplay accountId={runId} label="Run" />
      </div>
    </>
  );
}
