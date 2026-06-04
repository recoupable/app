"use client";

import { ArrowRight, LayoutList, ListChecks, ListTodo } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ToolLayout } from "./ToolLayout";
import type { ToolRendererProps } from "./renderTool";

type Todo = { id?: string; content?: string; status?: string };

function CompletedIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={cn("h-3.5 w-3.5", className)}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 8.5L7 10.5L11 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InProgressIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-3.5 w-3.5 items-center justify-center",
        className,
      )}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="absolute inset-0 h-3.5 w-3.5"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="7.25" fill="currentColor" />
      </svg>
      <ArrowRight className="relative h-2 w-2 text-muted" strokeWidth={3} />
    </span>
  );
}

function PendingIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={cn("h-3.5 w-3.5", className)}
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3.5 2.5"
      />
    </svg>
  );
}

function TodoItem({ todo }: { todo: Todo }) {
  const status = todo.status ?? "pending";
  const content = todo.content ?? "";

  return (
    <div className="flex items-start gap-2 py-0.5">
      <span className="mt-0.5 flex shrink-0 items-center">
        {status === "completed" ? (
          <CompletedIcon className="text-muted-foreground/50" />
        ) : status === "in_progress" ? (
          <InProgressIcon className="text-muted-foreground/50" />
        ) : (
          <PendingIcon className="text-muted-foreground/30" />
        )}
      </span>
      <span
        className={cn(
          "text-xs leading-relaxed",
          status === "completed"
            ? "text-muted-foreground/40 line-through"
            : status === "in_progress"
              ? "text-muted-foreground"
              : "text-muted-foreground/50",
        )}
      >
        {content}
      </span>
    </div>
  );
}

export function TodoRenderer({ part, state }: ToolRendererProps) {
  const input = part.input as { todos?: Todo[] } | undefined;
  const todos: Todo[] = (input?.todos ?? []).filter(
    (t): t is Todo => t !== undefined,
  );

  const activeTodo = todos.find((todo) => todo?.status === "in_progress");
  const completedCount = todos.filter(
    (todo) => todo?.status === "completed",
  ).length;
  const allDone = completedCount === todos.length && todos.length > 0;
  const noneStarted = completedCount === 0 && !activeTodo;

  let name: string;
  let icon: ReactNode;
  let statusMeta: string | undefined;

  if (allDone) {
    name = "All tasks completed";
    icon = <ListChecks className="h-3.5 w-3.5" />;
  } else if (activeTodo?.content) {
    name = activeTodo.content;
    statusMeta = "→ in progress";
    icon = <ListTodo className="h-3.5 w-3.5" />;
  } else if (noneStarted) {
    name = `${todos.length} task${todos.length !== 1 ? "s" : ""} created`;
    icon = <LayoutList className="h-3.5 w-3.5" />;
  } else {
    name = `${todos.length} task${todos.length !== 1 ? "s" : ""} updated`;
    statusMeta = `${completedCount}/${todos.length} done`;
    icon = <ListTodo className="h-3.5 w-3.5" />;
  }

  const expandedContent =
    todos.length > 0 ? (
      <div className="max-h-48 space-y-0.5 overflow-y-auto pl-6">
        {todos.map((todo, i) => (
          <TodoItem key={todo.id ?? i} todo={todo} />
        ))}
      </div>
    ) : undefined;

  return (
    <ToolLayout
      name={name}
      icon={icon}
      summary=""
      meta={statusMeta}
      state={state}
      expandedContent={expandedContent}
      defaultExpanded={false}
    />
  );
}
