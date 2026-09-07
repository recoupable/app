"use client";

import { Pencil } from "lucide-react";
import { useMemo } from "react";
import { ToolLayout } from "./ToolLayout";
import { FileNamePill } from "./FileNamePill";
import type { ToolRendererProps } from "./renderTool";

type EditInput = { filePath?: string; oldString?: string; newString?: string };
type EditOutput = { success?: boolean; error?: string };

export function EditRenderer({
  part,
  state,
  onApprove,
  onDeny,
}: ToolRendererProps) {
  const input = part.input as EditInput | undefined;
  const filePath = input?.filePath ?? "...";
  const oldString = input?.oldString ?? "";
  const newString = input?.newString ?? "";

  const { additions, removals } = useMemo(() => {
    const oldLines = oldString.split("\n");
    const newLines = newString.split("\n");

    const oldCounts = new Map<string, number>();
    for (const line of oldLines) {
      oldCounts.set(line, (oldCounts.get(line) ?? 0) + 1);
    }
    const newCounts = new Map<string, number>();
    for (const line of newLines) {
      newCounts.set(line, (newCounts.get(line) ?? 0) + 1);
    }

    let add = 0;
    for (const [line, count] of newCounts) {
      add += Math.max(0, count - (oldCounts.get(line) ?? 0));
    }
    let remove = 0;
    for (const [line, count] of oldCounts) {
      remove += Math.max(0, count - (newCounts.get(line) ?? 0));
    }
    return { additions: add, removals: remove };
  }, [oldString, newString]);

  const output =
    part.state === "output-available"
      ? (part.output as EditOutput | undefined)
      : undefined;
  const outputError =
    output?.success === false ? (output?.error ?? "Edit failed") : undefined;

  const mergedState = outputError
    ? { ...state, error: state.error ?? outputError }
    : state;

  const showDiff =
    mergedState.approvalRequested ||
    (!mergedState.running && !mergedState.error && !mergedState.denied);

  const expandedContent =
    showDiff && !mergedState.denied && (oldString || newString) ? (
      <div className="max-h-96 overflow-auto rounded-md border border-border bg-muted/50 p-3 font-mono text-xs leading-relaxed">
        {oldString
          .split("\n")
          .filter((_, i, arr) => !(arr.length === 1 && arr[0] === ""))
          .map((line, i) => (
            <div key={`old-${i}`} className="whitespace-pre-wrap text-red-400">
              <span className="select-none text-red-500">- </span>
              {line}
            </div>
          ))}
        {newString
          .split("\n")
          .filter((_, i, arr) => !(arr.length === 1 && arr[0] === ""))
          .map((line, i) => (
            <div
              key={`new-${i}`}
              className="whitespace-pre-wrap text-green-400"
            >
              <span className="select-none text-green-500">+ </span>
              {line}
            </div>
          ))}
      </div>
    ) : undefined;

  const meta =
    showDiff && !mergedState.denied ? (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-green-500">+{additions}</span>
        <span className="text-red-500">-{removals}</span>
      </span>
    ) : undefined;

  return (
    <ToolLayout
      name="Update"
      icon={<Pencil className="h-3.5 w-3.5" />}
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
