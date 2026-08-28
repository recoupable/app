"use client";

import { Terminal } from "lucide-react";
import { ToolLayout } from "./ToolLayout";
import type { ToolRendererProps } from "./renderTool";

type BashInput = { command?: string; cwd?: string; detached?: boolean };
type BashOutput = {
  success?: boolean;
  exitCode?: number | null;
  stdout?: string;
  stderr?: string;
};

export function BashRenderer({
  part,
  state,
  onApprove,
  onDeny,
}: ToolRendererProps) {
  const input = part.input as BashInput | undefined;
  const command = String(input?.command ?? "");
  const isDetached = input?.detached === true;

  const output =
    part.state === "output-available"
      ? (part.output as BashOutput | undefined)
      : undefined;
  const exitCode = output?.exitCode;
  const stdout = output?.stdout;
  const stderr = output?.stderr;
  const hasOutput = Boolean(stdout || stderr);
  const toolFailed = output?.success === false;
  const isError =
    toolFailed || (typeof exitCode === "number" && exitCode !== 0);

  const combinedOutput = [stdout, stderr].filter(Boolean).join("\n").trim();
  const hasExpandableContent = part.state === "output-available" || isDetached;

  // When bash errors, route through ToolLayout's standard error UI.
  const mergedState =
    isError && !state.error
      ? { ...state, error: `Exit code ${exitCode ?? "unknown"}` }
      : state;

  const meta = isDetached ? (
    <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-[11px] font-medium text-blue-500">
      detached
    </span>
  ) : undefined;

  const errorMetaContent =
    isError && exitCode !== undefined && exitCode !== null
      ? `exit ${exitCode}`
      : undefined;

  const expandedContent = hasExpandableContent ? (
    isError ? (
      hasOutput ? (
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2 font-mono text-xs leading-relaxed text-red-400">
          {combinedOutput}
        </pre>
      ) : undefined
    ) : (
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-muted/50 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
        {hasOutput ? combinedOutput : "(No output)"}
      </pre>
    )
  ) : undefined;

  return (
    <ToolLayout
      name="Bash"
      summary={command || "..."}
      summaryClassName="font-mono"
      meta={meta}
      errorMeta={errorMetaContent}
      state={mergedState}
      icon={<Terminal className="h-3.5 w-3.5" />}
      expandedContent={expandedContent}
      onApprove={onApprove}
      onDeny={onDeny}
    />
  );
}
