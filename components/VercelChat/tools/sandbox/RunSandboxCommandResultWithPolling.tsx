"use client";

import { useTaskRunStatus } from "@/hooks/useTaskRunStatus";
import RunDetails from "@/components/TasksPage/Run/RunDetails";
import CompactRunSkeleton from "./CompactRunSkeleton";

export default function RunSandboxCommandResultWithPolling({ runId }: { runId: string }) {
  const { data, isLoading } = useTaskRunStatus(runId);

  if (isLoading || !data) {
    return <CompactRunSkeleton />;
  }

  return <RunDetails runId={runId} data={data} variant="chat-compact" />;
}
