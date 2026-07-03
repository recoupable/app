import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import getAccountCredits, {
  AccountCredits,
} from "@/lib/recoup/getAccountCredits";
import { useUserProvider } from "@/providers/UserProvder";

const useCredits = (): UseQueryResult<AccountCredits> => {
  const { userData } = useUserProvider();
  const { getAccessToken, authenticated } = usePrivy();
  return useQuery({
    queryKey: ["credits", userData?.account_id],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to load credits");
      }
      return getAccountCredits(userData?.account_id as string, accessToken);
    },
    enabled: authenticated && !!userData?.account_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

export default useCredits;
