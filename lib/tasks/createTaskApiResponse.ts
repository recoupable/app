import type { Task } from "./getTasks";

/**
 * POST /api/tasks JSON body — separate from {@link GetTasksResponse} (GET list)
 * even when the wire shape overlaps (success returns `tasks` for parity with GET).
 */
export type CreateTaskApiSuccessBody = {
  status: "success";
  tasks: Task[];
};

export type CreateTaskApiErrorBody = {
  status: "error";
  error?: string;
};

export type CreateTaskApiResponse =
  | CreateTaskApiSuccessBody
  | CreateTaskApiErrorBody;
