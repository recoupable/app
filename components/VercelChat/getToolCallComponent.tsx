import { ToolUIPart, getToolOrDynamicToolName, DynamicToolUIPart } from "ai";
import getToolInfo from "@/lib/tools/getToolInfo";
import { ToolStatusPill } from "./tools/shared/ToolStatusPill";
import { TOOL_CALL_SKELETONS } from "./toolCallSkeletons";

/**
 * Renders the loading state for an in-flight tool call: a bespoke skeleton when
 * the tool has one (see TOOL_CALL_SKELETONS), otherwise an animated status pill.
 */
export function getToolCallComponent(part: ToolUIPart | DynamicToolUIPart) {
  const { toolCallId } = part;
  const toolName = getToolOrDynamicToolName(part);
  const skeleton = TOOL_CALL_SKELETONS[toolName] ?? (
    <ToolStatusPill label={getToolInfo(toolName).runningLabel} />
  );
  return <div key={toolCallId}>{skeleton}</div>;
}
