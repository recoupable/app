"use client";

import { ArrowRight, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToolRenderState } from "@/lib/chat/extractToolRenderState";
import { summarizeTodos, type Todo } from "@/lib/chat/summarizeTodos";
import { ToolLayout } from "./ToolLayout";

export interface TodoRendererProps {
  input?: { todos?: Todo[] };
  state: ToolRenderState;
}

function StatusIcon({ status }: { status?: string }) {
  if (status === "completed") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 8.5L7 10.5L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="relative inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center text-amber-500">
        <svg viewBox="0 0 16 16" fill="none" className="absolute inset-0 h-3.5 w-3.5" aria-hidden="true">
          <circle cx="8" cy="8" r="7.25" fill="currentColor" />
        </svg>
        <ArrowRight className="relative h-2 w-2 text-background" strokeWidth={3} />
      </span>
    );
  }
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.5 2.5" />
    </svg>
  );
}

/**
 * The agent's plan, updating in place.
 *
 * Rendered as one checklist rather than a fresh list per `todo_write` call —
 * the agent rewrites the whole list every time, so appending would stack N
 * copies of the same plan down the thread.
 *
 * Ported from `open-agents` (`renderers/todo-renderer.tsx`).
 */
export function TodoRenderer({ input, state }: TodoRendererProps) {
  const todos = input?.todos ?? [];
  const { completed, total, current } = summarizeTodos(todos);

  return (
    <ToolLayout
      name="Plan"
      icon={<ListTodo className="h-3.5 w-3.5" />}
      summary={total > 0 ? `${completed} of ${total} done` : "…"}
      meta={current}
      state={state}
      expandedContent={
        todos.length > 0 ? (
          <ul className="ml-1.5 flex flex-col gap-0.5">
            {todos.map((todo, i) => (
              <li
                key={`${i}-${todo.content ?? ""}`}
                className={cn(
                  "flex items-start gap-2 py-0.5 text-[13px] leading-snug",
                  todo.status === "completed" && "text-muted-foreground line-through",
                  todo.status === "in_progress" && "font-medium text-foreground",
                  todo.status !== "completed" && todo.status !== "in_progress" && "text-muted-foreground",
                )}
              >
                <span className="mt-0.5">
                  <StatusIcon status={todo.status} />
                </span>
                <span>{todo.content}</span>
              </li>
            ))}
          </ul>
        ) : undefined
      }
    />
  );
}
