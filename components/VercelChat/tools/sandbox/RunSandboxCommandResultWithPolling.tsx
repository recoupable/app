"use client";

import { useTaskRunStatus } from "@/hooks/useTaskRunStatus";
import CompactRunSkeleton from "./CompactRunSkeleton";
import ChatSandboxRunDetails from "./ChatSandboxRunDetails";

export default function RunSandboxCommandResultWithPolling({ runId }: { runId: string }) {
  const { data, isLoading } = useTaskRunStatus(runId);

  if (isLoading || !data) {
    return <CompactRunSkeleton />;
  }

  return <ChatSandboxRunDetails runId={runId} data={data} />;
}
