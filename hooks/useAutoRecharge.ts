import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import getAutoRechargeSetting from "@/lib/recoup/getAutoRechargeSetting";
import updateAutoRechargeSetting from "@/lib/recoup/updateAutoRechargeSetting";
import { useUserProvider } from "@/providers/UserProvder";

/**
 * Reads and updates the account's automatic top-up setting. The value is the
 * live Stripe-read state from the api (never a cached local flag), so the
 * toggle always shows the consent the charge path will actually honor.
 */
const useAutoRecharge = () => {
  const { userData } = useUserProvider();
  const { getAccessToken, authenticated } = usePrivy();
  const queryClient = useQueryClient();
  const accountId = userData?.account_id as string | undefined;

  const query = useQuery({
    queryKey: ["auto-recharge", accountId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to load the auto top-up setting");
      }
      return getAutoRechargeSetting(accountId as string, accessToken);
    },
    enabled: authenticated && !!accountId,
  });

  const mutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to update the auto top-up setting");
      }
      return updateAutoRechargeSetting(accountId as string, accessToken, enabled);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["auto-recharge", accountId], data);
    },
  });

  return {
    enabled: query.data?.enabled ?? true,
    isLoading: query.isLoading,
    isUpdating: mutation.isPending,
    setEnabled: mutation.mutate,
  };
};

export default useAutoRecharge;
