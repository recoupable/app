export type TodoStatus = "pending" | "in_progress" | "completed";

export interface Todo {
  content?: string;
  status?: string;
  activeForm?: string;
}

export interface TodoSummary {
  completed: number;
  total: number;
  /** The item being worked on now, for the collapsed row. */
  current?: string;
}

/**
 * Reduce a todo list to the one line the collapsed row shows.
 *
 * During a multi-minute render this line is the whole progress story, so it
 * names the in-progress item rather than just counting (recoupable/app#2052).
 *
 * @param todos - The list as written by `todo_write`.
 * @returns Completed count, total, and the current item's label.
 */
export function summarizeTodos(todos: Todo[]): TodoSummary {
  const completed = todos.filter((t) => t.status === "completed").length;
  const active = todos.find((t) => t.status === "in_progress");

  return {
    completed,
    total: todos.length,
    current: active?.activeForm?.trim() || active?.content?.trim() || undefined,
  };
}
