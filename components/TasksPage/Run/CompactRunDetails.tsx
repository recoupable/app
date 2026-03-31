"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { TaskRunStatus } from "@/lib/tasks/getTaskRunStatus";
import { formatTimestamp } from "@/lib/tasks/formatTimestamp";
import { formatDuration } from "@/lib/tasks/formatDuration";
import { cn } from "@/lib/utils";

export interface CompactRunDetailsProps {
  runId: string;
  displayName: string;
  displayDuration: number | null;
  statusLabel: string;
  statusIcon: ReactNode;
  badgeClassName: string;
  summaryText?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  detailsContent: ReactNode;
  data: TaskRunStatus;
}

export default function CompactRunDetails({
  runId,
  displayName,
  displayDuration,
  statusLabel,
  statusIcon,
  badgeClassName,
  summaryText,
  isOpen,
  onOpenChange,
  detailsContent,
  data,
}: CompactRunDetailsProps) {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onOpenChange}
      className="w-full overflow-hidden rounded-2xl border bg-background/80 shadow-sm"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
        >
          <div className="shrink-0">{statusIcon}</div>
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
                {statusLabel}
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
          <ChevronDownIcon
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
              rel="noopener noreferrer"
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
