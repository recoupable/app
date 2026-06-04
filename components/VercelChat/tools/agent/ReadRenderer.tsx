"use client";

import { FileText } from "lucide-react";
import { ToolLayout } from "./ToolLayout";
import { FileNamePill } from "./FileNamePill";
import type { ToolRendererProps } from "./renderTool";

type ReadInput = { filePath?: string };
type ReadOutput = {
  success?: boolean;
  error?: string;
  totalLines?: number;
  startLine?: number;
  endLine?: number;
  content?: string;
};

export function ReadRenderer({
  part,
  state,
  onApprove,
  onDeny,
}: ToolRendererProps) {
  const input = part.input as ReadInput | undefined;
  const filePath = input?.filePath ?? "...";

  const output =
    part.state === "output-available"
      ? (part.output as ReadOutput | undefined)
      : undefined;
  const totalLines = output?.totalLines;
  const startLine = output?.startLine;
  const endLine = output?.endLine;
  const fileContent = output?.content;
  const isPartialRead =
    startLine !== undefined &&
    endLine !== undefined &&
    totalLines !== undefined &&
    (startLine > 1 || endLine < totalLines);
  const outputError =
    output?.success === false ? (output?.error ?? "Read failed") : undefined;

  const mergedState = outputError
    ? { ...state, error: state.error ?? outputError }
    : state;

  // Content arrives with "N: " line-number prefixes; strip for display.
  const cleanContent = fileContent
    ? fileContent
        .split("\n")
        .map((line) => line.replace(/^\d+: /, ""))
        .join("\n")
    : undefined;

  const expandedContent = cleanContent ? (
    <pre className="max-h-96 overflow-auto rounded-md border border-border bg-muted/50 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
      {cleanContent}
    </pre>
  ) : undefined;

  const meta = isPartialRead
    ? `[${startLine}–${endLine}]`
    : totalLines !== undefined
      ? `${totalLines} lines`
      : undefined;

  return (
    <ToolLayout
      name="Read"
      icon={<FileText className="h-3.5 w-3.5" />}
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
