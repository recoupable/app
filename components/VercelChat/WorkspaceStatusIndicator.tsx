"use client";

import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/common/Tooltip";

/**
 * Lifecycle of the chat workspace (recoup-api session + sandbox) backing
 * the workflow transport:
 * - `off`          — no workspace (provisioning failed / unavailable)
 * - `provisioning` — session + sandbox being created; Send stays gated
 * - `ready`        — workspace live; Send enabled
 */
export type WorkspaceStatus = "off" | "provisioning" | "ready";

const STATUS_CONFIG: Record<
  WorkspaceStatus,
  { dotClassName: string; pulse: boolean; tooltip: string }
> = {
  off: {
    dotClassName: "bg-red-500",
    pulse: false,
    tooltip: "Workspace unavailable — refresh to try again.",
  },
  provisioning: {
    dotClassName: "bg-yellow-500",
    pulse: true,
    tooltip: "Preparing your workspace",
  },
  ready: {
    dotClassName: "bg-green-500",
    pulse: false,
    tooltip: "Workspace ready.",
  },
};

/**
 * Stoplight status dot for the chat workspace: red = off, yellow =
 * provisioning, green = ready. Hover for context. Pure display component —
 * the status is owned by the chat context and passed in, so this stays
 * open for reuse without modification (recoupable/chat#1767).
 */
export default function WorkspaceStatusIndicator({
  status,
  className,
  onRetry,
}: {
  status: WorkspaceStatus;
  className?: string;
  onRetry?: () => void;
}) {
  const { dotClassName, pulse, tooltip } = STATUS_CONFIG[status];

  if (status === "off")
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-xs text-destructive",
          className,
        )}
      >
        <span role="status">Couldn’t connect to chat.</span>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded px-1 font-medium underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          >
            Retry
          </button>
        ) : (
          <span>Refresh to try again.</span>
        )}
      </div>
    );
  if (status === "provisioning")
    return (
      <span
        role="status"
        className={cn("text-xs text-muted-foreground", className)}
      >
        Connecting to chat…
      </span>
    );

  return (
    <Tooltip content={tooltip}>
      <span
        role="status"
        aria-label={tooltip}
        className={cn(
          "inline-flex size-3 items-center justify-center",
          className,
          onRetry,
        )}
      >
        <span
          className={cn(
            "size-2 rounded-full",
            dotClassName,
            pulse && "animate-pulse",
          )}
        />
      </span>
    </Tooltip>
  );
}
