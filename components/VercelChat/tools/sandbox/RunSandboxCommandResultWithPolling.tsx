"use client";

import { useTaskRunStatus } from "@/hooks/useTaskRunStatus";
import RunDetails from "@/components/TasksPage/Run/RunDetails";

function CompactRunSkeleton() {
  return (
    <div className="w-full rounded-2xl border bg-background/80 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="size-5 animate-pulse rounded-full bg-muted" />
        <div className="min-w-0 flex-1">
          <div className="h-4 w-36 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-56 animate-pulse rounded bg-muted" />
        </div>
        <div className="size-4 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export default function RunSandboxCommandResultWithPolling({ runId }: { runId: string }) {
  const { data, isLoading } = useTaskRunStatus(runId);

  if (isLoading || !data) {
    return <CompactRunSkeleton />;
  }

  return <RunDetails runId={runId} data={data} variant="chat-compact" />;
}
