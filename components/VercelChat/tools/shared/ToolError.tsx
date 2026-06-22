"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { ToolCard, ToolCardBody } from "./ToolCard";
import { cn } from "@/lib/utils";
import { humanizeToolName } from "@/lib/tools/humanizeToolName";

/**
 * Unified error state for any chat tool response.
 *
 * Previously a tool that resolved to `output-error` fell through to the
 * loading skeleton and span forever. This gives every failure a clear,
 * consistent, non-alarming surface with an optional retry affordance.
 */

interface ToolErrorProps {
  /** Human label for the tool, e.g. "Web search". */
  title?: string;
  /** Detailed, user-facing error message. */
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ToolError({
  title,
  message,
  onRetry,
  className,
}: ToolErrorProps) {
  return (
    <ToolCard
      icon={AlertTriangle}
      tone="error"
      emphasized
      title={`${humanizeToolName(title)} didn't complete`}
      subtitle="The tool ran into a problem"
      className={cn("max-w-md", className)}
    >
      <ToolCardBody className="space-y-3">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {message?.trim() ||
            "Something went wrong while running this tool. You can try again."}
        </p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <RefreshCcw className="size-3.5" />
            Try again
          </button>
        ) : null}
      </ToolCardBody>
    </ToolCard>
  );
}

export default ToolError;
