import { useQuery } from "@tanstack/react-query";
import { Tables } from "@/types/database.types";
import { getTasks } from "@/lib/tasks/getTasks";

type ScheduledAction = Tables<"scheduled_actions">;

interface UseScheduledActionsParams {
  artistAccountId?: string;
}

export const useScheduledActions = ({ artistAccountId }: UseScheduledActionsParams) => {
  return useQuery<ScheduledAction[]>({
    queryKey: ["scheduled-actions", { artistAccountId }],
    queryFn: () =>
      getTasks({
        ...(artistAccountId ? { artist_account_id: artistAccountId } : {}),
      }),
    enabled: Boolean(artistAccountId),
  });
};
