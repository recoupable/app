import type { ToolUIPart } from "ai";
import type { ToolRenderState } from "./toolState";

/** Props shared by every agent tool renderer. */
export type ToolRendererProps = {
  part: ToolUIPart;
  state: ToolRenderState;
  onApprove?: (id: string) => void;
  onDeny?: (id: string, reason?: string) => void;
};

/**
 * Coding-agent tools that get a dedicated interactive renderer. Any tool not in
 * this set falls through to the legacy / generic rendering path.
 */
export const AGENT_TOOL_NAMES = new Set([
  "bash",
  "read",
  "write",
  "edit",
  "grep",
  "glob",
  "todo_write",
  "web_fetch",
  "task",
  "skill",
  "ask_user_question",
]);

export function isAgentToolName(name: string): boolean {
  return AGENT_TOOL_NAMES.has(name);
}
