"use client";

import { type ToolUIPart, getToolOrDynamicToolName } from "ai";
import { ToolLayout } from "./ToolLayout";
import { BashRenderer } from "./BashRenderer";
import { ReadRenderer } from "./ReadRenderer";
import { WriteRenderer } from "./WriteRenderer";
import { EditRenderer } from "./EditRenderer";
import { GlobRenderer } from "./GlobRenderer";
import { GrepRenderer } from "./GrepRenderer";
import { TodoRenderer } from "./TodoRenderer";
import { FetchRenderer } from "./FetchRenderer";
import { SkillRenderer } from "./SkillRenderer";
import { AskUserQuestionRenderer } from "./AskUserQuestionRenderer";
import { TaskRenderer } from "./TaskRenderer";
import { extractRenderState, type GenericToolPart } from "./toolState";

export type ToolCallProps = {
  part: ToolUIPart;
  isStreaming?: boolean;
  onApprove?: (id: string) => void;
  onDeny?: (id: string, reason?: string) => void;
};

/**
 * Renders a coding-agent tool call (bash, read, edit, …) with a state-aware,
 * collapsible interactive shell. Dispatches on the tool name; unknown agent
 * tools fall back to a generic ToolLayout.
 */
export function ToolCall({
  part,
  isStreaming = false,
  onApprove,
  onDeny,
}: ToolCallProps) {
  const state = extractRenderState(
    part as unknown as GenericToolPart,
    null,
    isStreaming,
  );
  const toolName = getToolOrDynamicToolName(part);
  const rendererProps = { part, state, onApprove, onDeny };

  switch (toolName) {
    case "bash":
      return <BashRenderer {...rendererProps} />;
    case "read":
      return <ReadRenderer {...rendererProps} />;
    case "write":
      return <WriteRenderer {...rendererProps} />;
    case "edit":
      return <EditRenderer {...rendererProps} />;
    case "glob":
      return <GlobRenderer {...rendererProps} />;
    case "grep":
      return <GrepRenderer {...rendererProps} />;
    case "todo_write":
      return <TodoRenderer {...rendererProps} />;
    case "web_fetch":
      return <FetchRenderer {...rendererProps} />;
    case "skill":
      return <SkillRenderer {...rendererProps} />;
    case "ask_user_question":
      return <AskUserQuestionRenderer {...rendererProps} />;
    case "task":
      return <TaskRenderer {...rendererProps} />;
    default: {
      const name = toolName.charAt(0).toUpperCase() + toolName.slice(1);
      const input = part.input as Record<string, unknown> | undefined;
      const summary = input ? JSON.stringify(input).slice(0, 40) : "...";
      return (
        <ToolLayout
          name={name}
          summary={summary}
          summaryClassName="font-mono"
          meta={part.state === "output-available" ? "Done" : undefined}
          state={state}
          onApprove={onApprove}
          onDeny={onDeny}
        />
      );
    }
  }
}
