import { useQuery } from "@tanstack/react-query";
import { Tables } from "@/types/database.types";
import { getTasks } from "@/lib/tasks/getTasks";

type ScheduledAction = Tables<"scheduled_actions">;

interface UseScheduledActionsParams {
  artistAccountId?: string;
  accountIdOverride?: string;
}

export const useScheduledActions = ({
  artistAccountId,
  accountIdOverride,
}: UseScheduledActionsParams) => {
  return useQuery<ScheduledAction[]>({
    queryKey: ["scheduled-actions", { artistAccountId, accountIdOverride }],
    queryFn: () =>
      getTasks({
        ...(accountIdOverride ? { account_id: accountIdOverride } : {}),
        ...(artistAccountId ? { artist_account_id: artistAccountId } : {}),
      }),
  });
};
