"use client";

import { Globe } from "lucide-react";
import { ToolLayout } from "./ToolLayout";
import type { ToolRendererProps } from "./renderTool";

type FetchInput = { url?: string; method?: string };
type FetchOutput = {
  success?: boolean;
  status?: number | null;
  error?: string;
};

export function FetchRenderer({
  part,
  state,
  onApprove,
  onDeny,
}: ToolRendererProps) {
  const input = part.input as FetchInput | undefined;
  const url = input?.url ?? "...";
  const method = input?.method ?? "GET";

  const output =
    part.state === "output-available"
      ? (part.output as FetchOutput | undefined)
      : undefined;
  const status =
    output?.success === true && output.status != null
      ? output.status
      : undefined;
  const outputError =
    output?.success === false ? (output.error ?? "Fetch failed") : undefined;

  const mergedState = outputError
    ? { ...state, error: state.error ?? outputError }
    : state;

  const displayUrl = url.length > 60 ? `${url.slice(0, 57)}...` : url;
  const summary = method === "GET" ? displayUrl : `${method} ${displayUrl}`;

  return (
    <ToolLayout
      name="Fetch"
      icon={<Globe className="h-3.5 w-3.5" />}
      summary={summary}
      summaryClassName="font-mono"
      meta={status !== undefined ? `${status}` : undefined}
      state={mergedState}
      onApprove={onApprove}
      onDeny={onDeny}
    />
  );
}
