import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import {
  getMusicGenerations,
  MusicGenerationsResponse,
} from "@/lib/music/getMusicGenerations";
import { useUserProvider } from "@/providers/UserProvder";

/** How often to re-read while any generation is still rendering. */
const IN_FLIGHT_POLL_MS = 5000;

const useMusicGenerations = (): UseQueryResult<MusicGenerationsResponse> => {
  const { getAccessToken, authenticated } = usePrivy();
  const { userData } = useUserProvider();
  const accountId = userData?.account_id || "";

  return useQuery({
    queryKey: ["music-generations", accountId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No access token");
      return getMusicGenerations(accessToken);
    },
    enabled: !!accountId && authenticated,
    // Poll only while something is actually rendering, then stop. A gallery of
    // finished songs is static, and polling it forever would bill every idle
    // tab a request every five seconds.
    refetchInterval: (query) => {
      const generations = query.state.data?.generations ?? [];
      const inFlight = generations.some(
        (generation) =>
          generation.status === "pending" || generation.status === "processing",
      );
      return inFlight ? IN_FLIGHT_POLL_MS : false;
    },
    refetchOnWindowFocus: false,
  });
};

export default useMusicGenerations;
