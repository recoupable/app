import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getTasks, type Task } from "@/lib/tasks/getTasks";

/**
 * One scheduled task by id via `GET /api/tasks?id=` (chat#2006 item 2).
 * Resolves to null when the API returns no row (unknown id, or not the
 * caller's task). Keyed under "scheduled-actions" so task mutations
 * invalidate it with the list queries.
 */
export function useTask(taskId: string) {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery<Task | null>({
    queryKey: ["scheduled-actions", { id: taskId }],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to view this task");
      }
      const tasks = await getTasks(accessToken, { id: taskId });
      return tasks[0] ?? null;
    },
    enabled: !!taskId && authenticated,
  });
}
