import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import getAccountPaymentMethod, {
  AccountPaymentMethod,
} from "@/lib/recoup/getAccountPaymentMethod";

/** The default card on file for an account (own or a member org). */
const usePaymentMethod = (
  accountId: string | undefined,
): UseQueryResult<AccountPaymentMethod> => {
  const { getAccessToken, authenticated } = usePrivy();
  return useQuery({
    queryKey: ["paymentMethod", accountId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Please sign in to load billing");
      return getAccountPaymentMethod(accountId as string, accessToken);
    },
    enabled: authenticated && !!accountId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export default usePaymentMethod;
