import { useMemo } from "react";
import { useArtistProvider } from "@/providers/ArtistProvider";

interface UseArtistImageResult {
  imageUrl: string | null;
  artistName: string | null;
}

export const useArtistImage = (
  artistAccountId?: string | null
): UseArtistImageResult => {
  const { artists } = useArtistProvider();

  const artist = useMemo(() => {
    if (!artistAccountId) {
      return null;
    }

    const match = artists.find(
      (candidate) => candidate.account_id === artistAccountId
    );
    if (match) {
      return match;
    }

    return null;
  }, [artistAccountId, artists]);

  return {
    imageUrl: artist?.image ?? null,
    artistName: artist?.name ?? null,
  };
};

export default useArtistImage;
