export interface ToolRenderState {
  /** Actively executing right now. */
  running: boolean;
  /** Was running when the stream ended, so it will never resolve. */
  interrupted: boolean;
  /** Error text when the tool threw. */
  error?: string;
}

export interface RenderableToolPart {
  state: string;
  errorText?: string;
}

/**
 * Derive what a tool row should show from its part and the stream's state.
 *
 * Ported from `open-agents` (`packages/shared/lib/tool-state.ts`), trimmed of
 * the approval machinery our agent does not have.
 *
 * `interrupted` is the reason this is a function and not a pair of booleans at
 * the call site: a tool part that is still in a running state *after the stream
 * has ended* is not running, it is abandoned. Deriving that centrally is what
 * makes it impossible to render a spinner that can never resolve.
 *
 * @param part - The tool UI part.
 * @param isStreaming - Whether the assistant turn is still streaming.
 * @returns The state a renderer should draw.
 */
export function extractToolRenderState(
  part: RenderableToolPart,
  isStreaming: boolean,
): ToolRenderState {
  const isRunningState =
    part.state === "input-streaming" || part.state === "input-available";

  return {
    running: isRunningState && isStreaming,
    interrupted: isRunningState && !isStreaming,
    error: part.state === "output-error" ? part.errorText : undefined,
  };
}
