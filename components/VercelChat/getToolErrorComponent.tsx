import { ToolUIPart, getToolOrDynamicToolName, DynamicToolUIPart } from "ai";
import { ToolError } from "./tools/shared/ToolError";

/**
 * Unified error surface for any tool that resolves to `output-error`.
 * Without this, failed tools fell through to the loading skeleton and
 * appeared to hang forever.
 */
export function getToolErrorComponent(
  part: ToolUIPart | DynamicToolUIPart,
  onRetry?: () => void,
) {
  const { toolCallId } = part;
  const toolName = getToolOrDynamicToolName(part);
  // `errorText` is a runtime-populated field not yet in ToolUIPart's public type.
  const errorText = (part as { errorText?: string }).errorText;
  return (
    <div key={toolCallId}>
      <ToolError title={toolName} message={errorText} onRetry={onRetry} />
    </div>
  );
}
