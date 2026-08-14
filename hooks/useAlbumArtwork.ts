import { useQuery } from "@tanstack/react-query";
import { getAlbumArtwork } from "@/lib/spotify/getAlbumArtwork";

/**
 * Resolves album artwork by album + artist name via Spotify search.
 * Null album (missing metadata) disables the lookup; misses resolve to null
 * so the tile can fall back to a placeholder.
 */
const useAlbumArtwork = (album: string | null, artistName?: string) => {
  return useQuery({
    queryKey: ["albumArtwork", album, artistName],
    queryFn: () => getAlbumArtwork(album as string, artistName),
    enabled: !!album,
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export default useAlbumArtwork;
