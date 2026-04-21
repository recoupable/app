import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import {
  getSongsByIsrc,
  SongsByIsrcResponse,
} from "@/lib/catalog/getSongsByIsrc";

interface UseSongsByIsrcOptions {
  isrc: string;
  enabled?: boolean;
}

const useSongsByIsrc = ({
  isrc,
  enabled = true,
}: UseSongsByIsrcOptions): UseQueryResult<SongsByIsrcResponse> => {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery({
    queryKey: ["songsByIsrc", isrc],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No access token");
      return getSongsByIsrc(isrc, accessToken);
    },
    enabled: enabled && !!isrc && isrc.trim() !== "" && authenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export default useSongsByIsrc;
