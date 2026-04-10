import { useMutation } from "@tanstack/react-query";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { ArtistRecord } from "@/types/Artist";
import { usePrivy } from "@privy-io/react-auth";
import { toggleArtistPin } from "@/lib/artists/toggleArtistPin";
import { toast } from "sonner";

export const useArtistPinToggle = (artist: ArtistRecord | null) => {
  const { getAccessToken } = usePrivy();
  const { getArtists, setArtists } = useArtistProvider();

  const mutation = useMutation({
    mutationFn: async ({ artistId, pinned }: { artistId: string; pinned: boolean }) => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to pin an artist");
      }

      await toggleArtistPin(accessToken, artistId, pinned);
    },
    onMutate: async ({ artistId, pinned }) => {
      const previousPinned = artist?.pinned;

      setArtists((prevArtists: ArtistRecord[]) =>
        prevArtists.map((currentArtist: ArtistRecord) =>
          currentArtist.account_id === artistId
            ? { ...currentArtist, pinned }
            : currentArtist,
        ),
      );

      return { previousPinned, artistId };
    },
    onError: (error, _variables, context) => {
      if (typeof context?.previousPinned === "boolean") {
        setArtists((prevArtists: ArtistRecord[]) =>
          prevArtists.map((currentArtist: ArtistRecord) =>
            currentArtist.account_id === context.artistId
              ? { ...currentArtist, pinned: context.previousPinned }
              : currentArtist,
          ),
        );
      }

      toast.error(error instanceof Error ? error.message : "Failed to toggle artist pin");
    },
    onSuccess: async () => {
      try {
        await getArtists();
      } catch {
        toast.error("Pinned state updated, but failed to refresh artists");
      }
    },
  });

  const handlePinToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!artist || mutation.isPending) return;

    await mutation.mutateAsync({
      artistId: artist.account_id,
      pinned: !artist.pinned,
    });
  };

  return {
    handlePinToggle,
    isPinning: mutation.isPending,
  };
};
