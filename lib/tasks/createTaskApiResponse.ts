import type { Task } from "./getTasks";

/**
 * Parsed JSON body for POST /api/tasks (success uses the same envelope as list responses).
 */
export type CreateTaskApiResponse = {
  status: "success" | "error";
  tasks?: Task[];
  error?: string;
};
