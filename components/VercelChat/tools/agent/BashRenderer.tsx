"use client";

import { Terminal } from "lucide-react";
import type { ToolRenderState } from "@/lib/chat/extractToolRenderState";
import { ToolLayout } from "./ToolLayout";
import { extractMediaFromStdout } from "@/lib/chat/extractMediaFromStdout";
import { MediaResult } from "./MediaResult";

/** What `bashTool` returns from the sandbox. */
export interface BashOutput {
  success?: boolean;
  exitCode?: number | null;
  stdout?: string;
  stderr?: string;
  truncated?: boolean;
}

export interface BashRendererProps {
  input?: { command?: string; cwd?: string; detached?: boolean };
  output?: BashOutput;
  state: ToolRenderState;
}

/**
 * The sandbox agent's work is almost entirely `bash`, so this is the row a
 * reader sees most. The command is the summary; a non-zero exit turns the whole
 * row destructive and puts the code on the right.
 *
 * Ported from `open-agents` (`renderers/bash-renderer.tsx`) — its output shape
 * is already exactly ours. See recoupable/app#2052.
 */
export function BashRenderer({ input, output, state }: BashRendererProps) {
  const command = String(input?.command ?? "");
  const { exitCode, stdout, stderr } = output ?? {};
  // A command that exits non-zero used to render a green check, because the
  // default result branch never read the output at all.
  const failed =
    output?.success === false || (typeof exitCode === "number" && exitCode !== 0);

  const combined = [stdout, stderr].filter(Boolean).join("\n").trim();
  const mergedState: ToolRenderState =
    failed && !state.error
      ? { ...state, error: `Exit code ${exitCode ?? "unknown"}` }
      : state;

  // A finished asset plays under the row that produced it, and stays visible
  // whether or not the row is expanded.
  const media = failed ? null : extractMediaFromStdout(stdout);

  const expandedContent = output ? (
    <pre
      className={
        failed
          ? "max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 font-mono text-xs leading-relaxed text-destructive"
          : "max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-muted/50 p-3 font-mono text-xs leading-relaxed text-muted-foreground"
      }
    >
      {combined || "(No output)"}
      {output.truncated ? "\n…output truncated" : ""}
    </pre>
  ) : undefined;

  return (
    <>
      <ToolLayout
      name="Bash"
      summary={command || "…"}
      icon={<Terminal className="h-3.5 w-3.5" />}
      meta={
        failed && exitCode !== undefined && exitCode !== null ? (
          `exit ${exitCode}`
        ) : input?.detached ? (
          <span className="rounded-full bg-blue-500/12 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
            detached
          </span>
        ) : undefined
      }
      state={mergedState}
      expandedContent={expandedContent}
      />
      {media && (
        <div className="mt-2">
          <MediaResult media={media} />
        </div>
      )}
    </>
  );
}
