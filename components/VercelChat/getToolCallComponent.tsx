import { ToolUIPart, getToolOrDynamicToolName, DynamicToolUIPart } from "ai";
import GenericToolCard from "./tools/GenericToolCard";
import { TOOL_CALL_SKELETONS } from "./toolCallSkeletons";

/**
 * Renders the loading state for an in-flight tool call: a bespoke skeleton when
 * the tool has one (see TOOL_CALL_SKELETONS), otherwise the generic tool card,
 * which explains the step in plain English and echoes its input so repeated
 * calls read as distinct, intentional steps (not a frozen loop).
 */
export function getToolCallComponent(part: ToolUIPart | DynamicToolUIPart) {
  const { toolCallId } = part;
  const toolName = getToolOrDynamicToolName(part);
  const skeleton = TOOL_CALL_SKELETONS[toolName];
  if (skeleton) return <div key={toolCallId}>{skeleton}</div>;
  return (
    <div key={toolCallId}>
      <GenericToolCard
        name={toolName}
        input={(part as { input?: unknown }).input}
        state="loading"
      />
    </div>
  );
}
