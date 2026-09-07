"use client";

import { FilePlus } from "lucide-react";
import { ToolLayout } from "./ToolLayout";
import { FileNamePill } from "./FileNamePill";
import type { ToolRendererProps } from "./renderTool";

type WriteInput = { filePath?: string; content?: string };
type WriteOutput = { success?: boolean; error?: string };

export function WriteRenderer({
  part,
  state,
  onApprove,
  onDeny,
}: ToolRendererProps) {
  const input = part.input as WriteInput | undefined;
  const filePath = input?.filePath ?? "...";
  const content = input?.content ?? "";

  const totalLines = content.length === 0 ? 0 : content.split("\n").length;

  const output =
    part.state === "output-available"
      ? (part.output as WriteOutput | undefined)
      : undefined;
  const outputError =
    output?.success === false ? (output?.error ?? "Write failed") : undefined;

  const mergedState = outputError
    ? { ...state, error: state.error ?? outputError }
    : state;

  const showCode =
    mergedState.approvalRequested ||
    (!mergedState.running && !mergedState.error && !mergedState.denied);

  const expandedContent =
    showCode && !mergedState.denied && content ? (
      <pre className="max-h-96 overflow-auto rounded-md border border-border bg-muted/50 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
        {content}
      </pre>
    ) : undefined;

  const meta =
    showCode && !mergedState.denied ? (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-green-500">+{totalLines}</span>
        <span className="text-red-500">-0</span>
      </span>
    ) : undefined;

  return (
    <ToolLayout
      name="Create"
      icon={<FilePlus className="h-3.5 w-3.5" />}
      summary={
        filePath === "..." ? (
          filePath
        ) : (
          <FileNamePill
            filePath={filePath}
            error={Boolean(mergedState.error)}
          />
        )
      }
      meta={meta}
      errorMeta={mergedState.error ? "failed" : undefined}
      state={mergedState}
      expandedContent={expandedContent}
      onApprove={onApprove}
      onDeny={onDeny}
    />
  );
}
