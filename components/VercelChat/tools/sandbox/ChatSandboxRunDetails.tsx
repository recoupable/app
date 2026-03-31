"use client";

import { useElapsedMs } from "@/hooks/useElapsedMs";
import { useCompactRunDisclosure } from "@/hooks/useCompactRunDisclosure";
import type { TaskRunStatus } from "@/lib/tasks/getTaskRunStatus";
import { getTaskDisplayName } from "@/lib/tasks/getTaskDisplayName";
import { ERROR_STATUSES, FALLBACK_CONFIG, STATUS_CONFIG } from "@/components/TasksPage/Run/statusConfig";
import { STATUS_BADGE_CLASSES } from "@/components/TasksPage/Run/runDetailsConstants";
import CompactRunDetails from "@/components/TasksPage/Run/CompactRunDetails";
import RunDetailsContent from "@/components/TasksPage/Run/RunDetailsContent";

export interface ChatSandboxRunDetailsProps {
  runId: string;
  data: TaskRunStatus;
}

export default function ChatSandboxRunDetails({
  runId,
  data,
}: ChatSandboxRunDetailsProps) {
  const config = STATUS_CONFIG[data.status] ?? FALLBACK_CONFIG;
  const displayName = getTaskDisplayName(data.taskIdentifier);
  const displayDuration = useElapsedMs(data.startedAt, data.durationMs);
  const { isOpen, setIsOpen } = useCompactRunDisclosure(data.status);
  const badgeClassName =
    STATUS_BADGE_CLASSES[data.status] ??
    "border-border bg-muted/60 text-muted-foreground";
  const summaryText =
    ERROR_STATUSES.has(data.status) && data.error?.message
      ? data.error.message
      : data.metadata?.currentStep;

  return (
    <CompactRunDetails
      runId={runId}
      displayName={displayName}
      displayDuration={displayDuration}
      statusLabel={config.label}
      statusIcon={config.icon}
      badgeClassName={badgeClassName}
      summaryText={summaryText}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      detailsContent={<RunDetailsContent runId={runId} data={data} />}
      data={data}
    />
  );
}
