"use client";

import { type ReactNode, useState } from "react";
import { CircleX, Loader2, Minus, OctagonPause, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToolRenderState } from "@/lib/chat/extractToolRenderState";

export interface ToolLayoutProps {
  /** Tool label, e.g. "Bash". */
  name: string;
  /** The one-line summary — for bash, the command itself. */
  summary?: ReactNode;
  /** Right-aligned detail such as an exit code. */
  meta?: ReactNode;
  state: ToolRenderState;
  /** Revealed on click; the row is inert when this is absent. */
  expandedContent?: ReactNode;
  icon?: ReactNode;
}

/**
 * One dense row per tool call: icon, name, mono summary, right-aligned meta,
 * click to expand.
 *
 * Ported from `open-agents` (`apps/web/components/tool-call/tool-layout.tsx`),
 * retokenised to this app's variables. Density is the design constraint — the
 * agent emits many calls per turn, so a row is ~24px and the command *is* the
 * summary. See recoupable/app#2052.
 */
export function ToolLayout({
  name,
  summary,
  meta,
  state,
  expandedContent,
  icon,
}: ToolLayoutProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasError = Boolean(state.error);
  const canExpand = Boolean(expandedContent) || hasError;
  const tone = hasError
    ? "text-destructive"
    : state.interrupted
      ? "text-amber-600 dark:text-amber-500"
      : "text-foreground";

  const leading = state.running ? (
    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
  ) : hasError ? (
    <CircleX className="h-3.5 w-3.5 text-destructive" />
  ) : state.interrupted ? (
    <OctagonPause className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500" />
  ) : (
    (icon ?? <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />)
  );

  return (
    <div className="-mx-1.5">
      <div
        className={cn(
          "group flex min-w-0 select-none items-center gap-2 rounded-md px-1.5 py-1 text-sm",
          canExpand && "cursor-pointer transition-colors hover:bg-muted/50",
        )}
        {...(canExpand && {
          role: "button",
          tabIndex: 0,
          "aria-expanded": isExpanded,
          onClick: () => setIsExpanded((v) => !v),
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsExpanded((v) => !v);
            }
          },
        })}
      >
        <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground/70">
          {canExpand && !state.running ? (
            <>
              <span className="group-hover:hidden">{leading}</span>
              {isExpanded ? (
                <Minus className="hidden h-3.5 w-3.5 group-hover:block" />
              ) : (
                <Plus className="hidden h-3.5 w-3.5 group-hover:block" />
              )}
            </>
          ) : (
            leading
          )}
        </span>

        <span className={cn("shrink-0 font-medium leading-none", tone)}>{name}</span>

        {summary != null && (
          <span className="min-w-0 flex-1 truncate font-mono text-[13px] leading-none text-muted-foreground">
            {summary}
          </span>
        )}

        {meta != null && (
          <span className="shrink-0 font-mono text-xs leading-none text-muted-foreground/70">
            {meta}
          </span>
        )}
      </div>

      {isExpanded && canExpand && (
        <div className="mt-1.5 space-y-2 pb-1">
          {hasError && !expandedContent && (
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 font-mono text-xs leading-relaxed text-destructive">
              {state.error}
            </pre>
          )}
          {expandedContent}
        </div>
      )}
    </div>
  );
}
