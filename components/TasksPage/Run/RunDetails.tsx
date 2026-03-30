"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { TaskRunStatus } from "@/lib/tasks/getTaskRunStatus";
import { getTaskDisplayName } from "@/lib/tasks/getTaskDisplayName";
import { formatTimestamp } from "@/lib/tasks/formatTimestamp";
import { formatDuration } from "@/lib/tasks/formatDuration";
import { useElapsedMs } from "@/hooks/useElapsedMs";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ERROR_STATUSES, STATUS_CONFIG, FALLBACK_CONFIG } from "./statusConfig";
import RunLogsList from "./RunLogsList";
import RunTimeline from "./RunTimeline";
import RunOutput from "./RunOutput";
import RunErrorDetails from "./RunErrorDetails";
import AccountIdDisplay from "@/components/ArtistSetting/AccountIdDisplay";

interface RunDetailsProps {
  runId: string;
  data: TaskRunStatus;
  variant?: "full" | "chat-compact";
}

const TERMINAL_STATUSES = new Set([
  "COMPLETED",
  "FAILED",
  "CRASHED",
  "CANCELED",
  "SYSTEM_FAILURE",
  "INTERRUPTED",
]);

const STATUS_BADGE_CLASSES: Record<string, string> = {
  COMPLETED:
    "border-green-200 bg-green-50 text-green-700 dark:border-green-900/60 dark:bg-green-950/50 dark:text-green-300",
  FAILED:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300",
  CRASHED:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300",
  SYSTEM_FAILURE:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300",
  INTERRUPTED:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300",
  CANCELED:
    "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950/50 dark:text-gray-300",
  EXECUTING:
    "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-950/50 dark:text-yellow-300",
  REATTEMPTING:
    "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-950/50 dark:text-yellow-300",
  QUEUED:
    "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950/50 dark:text-gray-300",
  DELAYED:
    "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950/50 dark:text-gray-300",
  FROZEN:
    "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950/50 dark:text-gray-300",
  PENDING_VERSION:
    "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950/50 dark:text-gray-300",
};

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
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full overflow-hidden rounded-2xl border bg-background/80 shadow-sm"
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
          >
            <div className="shrink-0">{config.icon}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {displayName}
                </p>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                    badgeClassName,
                  )}
                >
                  {config.label}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>{formatTimestamp(data.createdAt)}</span>
                {displayDuration !== null && (
                  <span>{formatDuration(displayDuration)}</span>
                )}
                {summaryText && (
                  <span className="min-w-0 max-w-full truncate">
                    {summaryText}
                  </span>
                )}
              </div>
            </div>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                isOpen && "rotate-180",
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t bg-background/50">
          <div className="flex flex-col gap-6 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Run Details
              </p>
              <Link
                href={`/tasks/${runId}`}
                target="_blank"
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Open full run
              </Link>
            </div>
            {detailsContent}
          </div>
        </CollapsibleContent>
      </Collapsible>
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
