"use client";

import { useState } from "react";
import { Cog, Check, ChevronRight, CornerDownRight } from "lucide-react";
import { ToolCard, ToolCardBody } from "./shared/ToolCard";
import { cn } from "@/lib/utils";
import { humanizeToolName } from "@/lib/tools/humanizeToolName";
import getToolInfo from "@/lib/tools/getToolInfo";
import { summarizeToolInput } from "@/lib/tools/summarizeToolInput";

interface GenericToolCardProps {
  name: string;
  /** Raw tool input args — the most meaningful field is echoed so repeated
   *  calls of the same tool read as distinct, intentional steps. */
  input?: unknown;
  /** Raw tool output/result, shown in a collapsible "details" section. */
  output?: unknown;
  /** Optional explicit summary line (overrides the derived description). */
  message?: string;
  state?: "loading" | "success";
}

function toDisplayString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value.trim() || null;
  try {
    const text = JSON.stringify(value, null, 2);
    return text && text !== "{}" && text !== "null" ? text : null;
  } catch {
    return null;
  }
}

/**
 * Default card for tools without bespoke UI (including unknown/MCP tools).
 * Designed for non-technical users: a friendly name, a plain-English
 * explanation of what the step does, the specific input it ran this call, and
 * a collapsible look at the raw output.
 */
export function GenericToolCard({
  name,
  input,
  output,
  message,
  state = "success",
}: GenericToolCardProps) {
  const [open, setOpen] = useState(false);
  const loading = state === "loading";
  const info = getToolInfo(name);
  const inputSummary = summarizeToolInput(input);
  const outputText = loading ? null : toDisplayString(output);

  return (
    <ToolCard
      icon={Cog}
      tone={loading ? "neutral" : "success"}
      loading={loading}
      title={humanizeToolName(name)}
      subtitle={message?.trim() || info.description}
      className="max-w-md"
      trailing={
        loading ? (
          <span className="flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-amber-500" />
            Working
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <Check className="size-3" strokeWidth={3} />
            Done
          </span>
        )
      }
    >
      {inputSummary || outputText ? (
        <ToolCardBody className="space-y-2">
          {inputSummary ? (
            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5">
              <CornerDownRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <code
                className="min-w-0 flex-1 truncate font-mono text-xs text-foreground"
                title={inputSummary}
              >
                {inputSummary}
              </code>
            </div>
          ) : null}

          {outputText ? (
            <div>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                aria-expanded={open}
              >
                <ChevronRight
                  className={cn(
                    "size-3.5 transition-transform",
                    open && "rotate-90",
                  )}
                />
                {open ? "Hide output" : "Show output"}
              </button>
              {open ? (
                <pre className="mt-2 max-h-56 overflow-auto rounded-lg border border-border bg-muted/40 p-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  {outputText}
                </pre>
              ) : null}
            </div>
          ) : null}
        </ToolCardBody>
      ) : null}
    </ToolCard>
  );
}

export default GenericToolCard;
