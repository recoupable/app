import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getSongsByIsrc, SongsByIsrcResponse } from "@/lib/catalog/getSongsByIsrc";

interface UseSongsByIsrcOptions {
  isrc: string;
  enabled?: boolean;
}

const useSongsByIsrc = ({
  isrc,
  enabled = true,
}: UseSongsByIsrcOptions): UseQueryResult<SongsByIsrcResponse> => {
  return useQuery({
    queryKey: ["songsByIsrc", isrc],
    queryFn: () => getSongsByIsrc(isrc),
    enabled: enabled && !!isrc && isrc.trim() !== "",
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export default useSongsByIsrc;
