/**
 * Derives a common render state from a Vercel AI SDK tool part so every agent
 * tool renderer shares one notion of running / error / interrupted / approval.
 */

export type ToolRenderState = {
  /** Whether the tool is currently running */
  running: boolean;
  /** Whether the tool was interrupted (running when the stream stopped) */
  interrupted: boolean;
  /** Error message if the tool failed */
  error?: string;
  /** Whether the tool was denied by the user */
  denied: boolean;
  /** Reason for denial if provided */
  denialReason?: string;
  /** Whether approval is being requested */
  approvalRequested: boolean;
  /** Approval ID if approval is requested */
  approvalId?: string;
  /** Whether this is the currently active approval */
  isActiveApproval: boolean;
};

/** Loose tool-part shape so this works with any AI SDK tool/dynamic-tool part. */
export type GenericToolPart = {
  state: string;
  approval?: { id?: string; approved?: boolean; reason?: string };
  errorText?: string;
  input?: unknown;
  output?: unknown;
};

export function extractRenderState(
  part: GenericToolPart,
  activeApprovalId: string | null,
  isStreaming: boolean,
): ToolRenderState {
  const isRunningState =
    part.state === "input-streaming" || part.state === "input-available";
  const approval = part.approval;
  const denied = part.state === "output-denied" || approval?.approved === false;
  const denialReason = denied ? approval?.reason : undefined;
  const approvalRequested = part.state === "approval-requested" && !denied;
  const error = part.state === "output-error" ? part.errorText : undefined;
  const approvalId = approvalRequested ? approval?.id : undefined;
  const isActiveApproval =
    approvalId != null && approvalId === activeApprovalId;

  // Tool was running but the stream stopped → it was interrupted.
  const interrupted = isRunningState && !isStreaming;
  const running = isRunningState && isStreaming;

  return {
    running,
    interrupted,
    error,
    denied,
    denialReason,
    approvalRequested,
    approvalId,
    isActiveApproval,
  };
}

/**
 * Format a token count for compact display.
 * 500 → "500", 1200 → "1.2k", 999950 → "1.0m".
 */
export function formatTokens(tokens: number): string {
  if (tokens >= 999_950_000) return `${(tokens / 1_000_000_000).toFixed(1)}b`;
  if (tokens >= 999_950) return `${(tokens / 1_000_000).toFixed(1)}m`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}k`;
  return tokens.toLocaleString();
}
