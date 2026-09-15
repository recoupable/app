"use client";

import { cn } from "@/lib/utils";

/**
 * Lifecycle of the chat workspace (recoup-api session + sandbox) backing
 * the workflow transport:
 * - `off`          — no workspace (provisioning failed / unavailable)
 * - `provisioning` — session + sandbox being created; Send stays gated
 * - `ready`        — workspace live; Send enabled
 */
export type WorkspaceStatus = "off" | "provisioning" | "ready";

/** Show connection progress and recovery only; ready workspaces need no indicator. */
export default function WorkspaceStatusIndicator({
  status,
  className,
  onRetry,
}: {
  status: WorkspaceStatus;
  className?: string;
  onRetry?: () => void;
}) {
  if (status === "ready") return null;

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

  return null;
}
