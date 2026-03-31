import {
  ToolUIPart,
  UIDataTypes,
  UIMessagePart,
  UITools,
  getToolOrDynamicToolName,
  isToolOrDynamicToolUIPart,
} from "ai";

const DEFERRED_SANDBOX_TOOL_NAMES = new Set([
  "get_task_run_status",
  "prompt_sandbox",
]);

export function isDeferredSandboxResultPart(
  part: UIMessagePart<UIDataTypes, UITools>,
) {
  if (!isToolOrDynamicToolUIPart(part)) {
    return false;
  }

  return (
    (part as ToolUIPart).state === "output-available" &&
    DEFERRED_SANDBOX_TOOL_NAMES.has(getToolOrDynamicToolName(part))
  );
}
