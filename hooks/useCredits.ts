import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import getCredits from "@/lib/supabase/getCredits";
import { useUserProvider } from "@/providers/UserProvder";
import { Tables } from "@/types/database.types";

type CreditsUsage = Tables<"credits_usage">;

const useCredits = (): UseQueryResult<CreditsUsage> => {
  const { userData } = useUserProvider();
  const { getAccessToken, authenticated } = usePrivy();
  return useQuery({
    queryKey: ["credits", userData?.account_id],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return getCredits(accessToken!);
    },
    enabled: !!userData?.account_id && authenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export default useCredits;
