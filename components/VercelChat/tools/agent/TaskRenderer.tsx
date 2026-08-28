"use client";

import type { ToolUIPart } from "ai";
import {
  Bot,
  FilePlus,
  FileText,
  FolderSearch,
  Hammer,
  Paintbrush,
  Pencil,
  Search,
  Telescope,
  Terminal,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
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
import { extractRenderState, formatTokens } from "./toolState";
import type { ToolRendererProps } from "./renderTool";

const TOOL_ICON_CLASS = "h-3.5 w-3.5";

type PendingToolCall = { name: string; input?: unknown };
type TaskOutput = {
  pending?: PendingToolCall | null;
  toolCallCount?: number;
  usage?: { inputTokens?: number };
  final?: unknown;
};
type TaskInput = { task?: string; subagentType?: string };

function getToolMeta(toolName: string): {
  displayName: string;
  icon: ReactNode;
} {
  switch (toolName) {
    case "bash":
      return {
        displayName: "Bash",
        icon: <Terminal className={TOOL_ICON_CLASS} />,
      };
    case "read":
      return {
        displayName: "Read",
        icon: <FileText className={TOOL_ICON_CLASS} />,
      };
    case "write":
      return {
        displayName: "Create",
        icon: <FilePlus className={TOOL_ICON_CLASS} />,
      };
    case "edit":
      return {
        displayName: "Update",
        icon: <Pencil className={TOOL_ICON_CLASS} />,
      };
    case "grep":
      return {
        displayName: "Grep",
        icon: <Search className={TOOL_ICON_CLASS} />,
      };
    case "glob":
      return {
        displayName: "Glob",
        icon: <FolderSearch className={TOOL_ICON_CLASS} />,
      };
    case "skill":
      return {
        displayName: "Skill",
        icon: <Zap className={TOOL_ICON_CLASS} />,
      };
    default: {
      const name = toolName.charAt(0).toUpperCase() + toolName.slice(1);
      return { displayName: name, icon: <Bot className={TOOL_ICON_CLASS} /> };
    }
  }
}

function getToolSummary(name: string, input: unknown): string {
  const inp = input as Record<string, unknown> | undefined;
  if (!inp) return "";
  switch (name) {
    case "read":
    case "write":
    case "edit":
      return inp.filePath ? String(inp.filePath) : "";
    case "grep":
    case "glob":
      return inp.pattern ? `'${inp.pattern}'` : "";
    case "bash":
      return inp.command ? String(inp.command) : "";
    default:
      return "";
  }
}

/** Unwrap AI SDK tool output envelope: { type: "json", value: { ... } } */
function unwrapToolOutput(output: unknown): unknown {
  if (!output || typeof output !== "object") return output;
  const o = output as Record<string, unknown>;
  if (o.type === "json" && o.value && typeof o.value === "object") {
    return o.value;
  }
  return output;
}

type SynthPart = {
  type: string;
  toolCallId: string;
  input: unknown;
  output: unknown;
};

/** Pull completed tool calls out of a subagent's final message list. */
function extractToolParts(messages: unknown): SynthPart[] {
  if (!Array.isArray(messages)) return [];

  const calls: { id: string; name: string; input: unknown }[] = [];
  for (const msg of messages) {
    if (
      typeof msg !== "object" ||
      msg === null ||
      (msg as { role?: string }).role !== "assistant"
    )
      continue;
    const content = (msg as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const p of content) {
      if (
        typeof p === "object" &&
        p !== null &&
        (p as { type?: string }).type === "tool-call"
      ) {
        const tc = p as {
          toolCallId?: string;
          toolName?: string;
          input?: unknown;
        };
        if (tc.toolName && tc.toolCallId) {
          calls.push({ id: tc.toolCallId, name: tc.toolName, input: tc.input });
        }
      }
    }
  }

  const resultMap = new Map<string, unknown>();
  for (const msg of messages) {
    if (
      typeof msg !== "object" ||
      msg === null ||
      (msg as { role?: string }).role !== "tool"
    )
      continue;
    const content = (msg as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const p of content) {
      if (
        typeof p === "object" &&
        p !== null &&
        (p as { type?: string }).type === "tool-result"
      ) {
        const tr = p as { toolCallId?: string; output?: unknown };
        if (tr.toolCallId) resultMap.set(tr.toolCallId, tr.output);
      }
    }
  }

  return calls.map((call) => ({
    type: `tool-${call.name}`,
    toolCallId: call.id,
    input: call.input,
    output: unwrapToolOutput(resultMap.get(call.id)),
  }));
}

function countToolCalls(messages: unknown): number {
  if (!Array.isArray(messages)) return 0;
  return messages.filter(
    (m) =>
      typeof m === "object" &&
      m !== null &&
      (m as { role?: string }).role === "tool",
  ).length;
}

function getSubagentIcon(subagentType: string | undefined, className: string) {
  switch (subagentType) {
    case "executor":
      return <Hammer className={className} />;
    case "design":
      return <Paintbrush className={className} />;
    case "explorer":
      return <Telescope className={className} />;
    default:
      return <Bot className={className} />;
  }
}

function getSubagentLabel(subagentType: string | undefined): string {
  switch (subagentType) {
    case "executor":
      return "Executor Subagent";
    case "design":
      return "Design Subagent";
    case "explorer":
      return "Explorer Subagent";
    default:
      return subagentType
        ? `${subagentType.charAt(0).toUpperCase() + subagentType.slice(1)} Subagent`
        : "Subagent";
  }
}

/** Render one completed nested tool call using the real renderers. */
function SubagentToolCall({ part }: { part: SynthPart }) {
  const uiPart = {
    ...part,
    state: "output-available",
  } as unknown as ToolUIPart;
  const state = extractRenderState(uiPart, null, false);

  switch (part.type) {
    case "tool-bash":
      return <BashRenderer part={uiPart} state={state} />;
    case "tool-read":
      return <ReadRenderer part={uiPart} state={state} />;
    case "tool-write":
      return <WriteRenderer part={uiPart} state={state} />;
    case "tool-edit":
      return <EditRenderer part={uiPart} state={state} />;
    case "tool-glob":
      return <GlobRenderer part={uiPart} state={state} />;
    case "tool-grep":
      return <GrepRenderer part={uiPart} state={state} />;
    case "tool-todo_write":
      return <TodoRenderer part={uiPart} state={state} />;
    case "tool-web_fetch":
      return <FetchRenderer part={uiPart} state={state} />;
    case "tool-skill":
      return <SkillRenderer part={uiPart} state={state} />;
    default: {
      const name = part.type.slice(5);
      const meta = getToolMeta(name);
      return (
        <ToolLayout
          name={meta.displayName}
          icon={meta.icon}
          summary={getToolSummary(name, part.input)}
          summaryClassName="font-mono"
          state={state}
        />
      );
    }
  }
}

function PendingMiniToolCall({ name, input }: PendingToolCall) {
  const meta = getToolMeta(name);
  return (
    <ToolLayout
      name={meta.displayName}
      icon={meta.icon}
      summary={getToolSummary(name, input)}
      summaryClassName="font-mono"
      state={{
        running: false,
        interrupted: false,
        denied: false,
        approvalRequested: false,
        isActiveApproval: false,
      }}
    />
  );
}

export function TaskRenderer({
  part,
  state,
  onApprove,
  onDeny,
}: ToolRendererProps) {
  const input = part.input as TaskInput | undefined;
  const desc = input?.task ?? "Spawning subagent";
  const subagentType = input?.subagentType;
  const taskDenied = part.state === "output-denied";

  const hasOutput = part.state === "output-available";
  const isPreliminary =
    hasOutput && (part as { preliminary?: boolean }).preliminary === true;
  const isComplete = hasOutput && !isPreliminary;
  const output = hasOutput
    ? (part.output as TaskOutput | undefined)
    : undefined;

  const pendingToolCall = output?.pending ?? null;
  const toolCount =
    output?.toolCallCount ?? (isComplete ? countToolCalls(output?.final) : 0);
  const tokenCount = output?.usage?.inputTokens ?? null;

  const statParts: string[] = [];
  if (toolCount > 0) {
    statParts.push(`${toolCount} tool${toolCount !== 1 ? "s" : ""}`);
  }
  if (tokenCount !== null) {
    statParts.push(`${formatTokens(tokenCount)} tokens`);
  }

  const meta =
    statParts.length > 0 ? (
      <span className="font-mono text-xs text-muted-foreground/60">
        {statParts.join(" · ")}
      </span>
    ) : null;

  const completedParts = isComplete ? extractToolParts(output?.final) : [];
  const hasExpandableContent =
    pendingToolCall !== null || completedParts.length > 0;

  const expandedContent = hasExpandableContent ? (
    <div className="space-y-0.5 pl-6">
      {pendingToolCall && !isComplete && (
        <PendingMiniToolCall
          name={pendingToolCall.name}
          input={pendingToolCall.input}
        />
      )}
      {isComplete &&
        completedParts.map((toolPart) => (
          <SubagentToolCall key={toolPart.toolCallId} part={toolPart} />
        ))}
    </div>
  ) : undefined;

  return (
    <ToolLayout
      name={getSubagentLabel(subagentType)}
      summary={desc}
      summaryClassName="font-sans"
      meta={meta}
      rightAlignMeta
      state={state}
      icon={getSubagentIcon(subagentType, "h-3.5 w-3.5")}
      nameClassName={taskDenied ? "text-red-500" : undefined}
      expandedContent={expandedContent}
      onApprove={onApprove}
      onDeny={onDeny}
      defaultExpanded={!isComplete}
    />
  );
}
