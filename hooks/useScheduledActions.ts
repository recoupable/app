import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getTasks, Task } from "@/lib/tasks/getTasks";

interface UseScheduledActionsParams {
  artistAccountId?: string;
  accountIdOverride?: string;
}

export const useScheduledActions = ({
  artistAccountId,
  accountIdOverride,
}: UseScheduledActionsParams) => {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery<Task[]>({
    queryKey: ["scheduled-actions", { artistAccountId, accountIdOverride }],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to view scheduled actions");
      }

      return getTasks(accessToken, {
        ...(accountIdOverride ? { account_id: accountIdOverride } : {}),
        ...(artistAccountId ? { artist_account_id: artistAccountId } : {}),
      });
    },
    enabled: authenticated,
  });
};
