import { useQuery } from "@tanstack/react-query";
import { getTasks, Task } from "@/lib/tasks/getTasks";

interface UseScheduledActionsParams {
  artistAccountId?: string;
  accountIdOverride?: string;
}

export const useScheduledActions = ({
  artistAccountId,
  accountIdOverride,
}: UseScheduledActionsParams) => {
  return useQuery<Task[]>({
    queryKey: ["scheduled-actions", { artistAccountId, accountIdOverride }],
    queryFn: () =>
      getTasks({
        ...(accountIdOverride ? { account_id: accountIdOverride } : {}),
        ...(artistAccountId ? { artist_account_id: artistAccountId } : {}),
      }),
  });
};
