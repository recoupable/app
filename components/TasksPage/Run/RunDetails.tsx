"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { TaskRunStatus } from "@/lib/tasks/getTaskRunStatus";
import { getTaskDisplayName } from "@/lib/tasks/getTaskDisplayName";
import { useElapsedMs } from "@/hooks/useElapsedMs";
import { ERROR_STATUSES, STATUS_CONFIG, FALLBACK_CONFIG } from "./statusConfig";
import RunLogsList from "./RunLogsList";
import RunTimeline from "./RunTimeline";
import RunOutput from "./RunOutput";
import RunErrorDetails from "./RunErrorDetails";
import AccountIdDisplay from "@/components/ArtistSetting/AccountIdDisplay";
import { STATUS_BADGE_CLASSES, TERMINAL_STATUSES } from "./runDetailsConstants";
import CompactRunDetails from "./CompactRunDetails";

interface RunDetailsProps {
  runId: string;
  data: TaskRunStatus;
  variant?: "full" | "chat-compact";
}

export default function RunDetails({
  runId,
  data,
  variant = "full",
}: RunDetailsProps) {
  const config = STATUS_CONFIG[data.status] ?? FALLBACK_CONFIG;
  const logs = data.metadata?.logs ?? [];
  const currentStep = data.metadata?.currentStep;
  const pathname = usePathname();
  const isOnRunPage = pathname === `/tasks/${runId}`;
  const displayName = getTaskDisplayName(data.taskIdentifier);
  const displayDuration = useElapsedMs(data.startedAt, data.durationMs);
  const isTerminal = TERMINAL_STATUSES.has(data.status);
  const [isOpen, setIsOpen] = useState(!isTerminal);
  const badgeClassName =
    STATUS_BADGE_CLASSES[data.status] ??
    "border-border bg-muted/60 text-muted-foreground";
  const summaryText =
    ERROR_STATUSES.has(data.status) && data.error?.message
      ? data.error.message
      : currentStep;

  useEffect(() => {
    if (!isTerminal) {
      setIsOpen(true);
    }
  }, [isTerminal]);

  const detailsContent = (
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

  if (variant === "chat-compact") {
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
        detailsContent={detailsContent}
        data={data}
      />
    );
  }

  return (
    <div className="mx-auto flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        {config.icon}
        <div>
          {isOnRunPage ? (
            <h1 className="text-lg font-semibold">{displayName}</h1>
          ) : (
            <Link
              href={`/tasks/${runId}`}
              target="_blank"
              className="text-lg font-semibold hover:underline"
            >
              {displayName}
            </Link>
          )}
          <p className={`text-sm ${config.color}`}>{config.label}</p>
        </div>
      </div>

      {detailsContent}
    </div>
  );
}
