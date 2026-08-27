import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { deleteArtist } from "@/lib/artists/deleteArtist";
import { useArtistProvider } from "@/providers/ArtistProvider";

interface DeleteArtistOptions {
  onSuccess?: () => void;
}

interface UseDeleteArtistReturn {
  deleteArtist: (artistId: string, options?: DeleteArtistOptions) => Promise<void>;
}

export default function useDeleteArtist(): UseDeleteArtistReturn {
  const { getAccessToken } = usePrivy();
  const { artists, setArtists, getArtists } = useArtistProvider();

  const deleteArtistHandler = async (
    artistId: string,
    options?: DeleteArtistOptions,
  ): Promise<void> => {
    const previousArtists = artists;
    const nextArtists = artists.filter(artist => artist.account_id !== artistId);
    setArtists(nextArtists);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to delete an artist");
      }

      await deleteArtist(accessToken, artistId);
      options?.onSuccess?.();
    } catch (error) {
      setArtists(previousArtists);
      toast.error(error instanceof Error ? error.message : "Failed to delete artist");
      return;
    }

    try {
      await getArtists();
    } catch {
      toast.error("Artist deleted, but failed to refresh the artist list");
    }
  };

  return {
    deleteArtist: deleteArtistHandler,
  };
}
