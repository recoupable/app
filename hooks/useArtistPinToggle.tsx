import { useState } from "react";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { ArtistRecord } from "@/types/Artist";
import { usePrivy } from "@privy-io/react-auth";
import { toggleArtistPin } from "@/lib/artists/toggleArtistPin";
import { toast } from "sonner";

export const useArtistPinToggle = (artist: ArtistRecord | null) => {
  const { getAccessToken } = usePrivy();
  const { getArtists, setArtists } = useArtistProvider();
  const [isPinning, setIsPinning] = useState(false);

  const handlePinToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!artist || isPinning) return;

    const newPinnedStatus = !artist.pinned;

    // Optimistic update - immediately update the UI
    setArtists((prevArtists: ArtistRecord[]) =>
      prevArtists.map((a: ArtistRecord) =>
        a.account_id === artist.account_id ? { ...a, pinned: newPinnedStatus } : a,
      ),
    );

    setIsPinning(true);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to pin an artist");
      }

      await toggleArtistPin(accessToken, artist.account_id, newPinnedStatus);

      // Refetch to ensure consistency with server
      await getArtists();
    } catch (error) {
      // Rollback optimistic update on error
      setArtists((prevArtists: ArtistRecord[]) =>
        prevArtists.map((a: ArtistRecord) =>
          a.account_id === artist.account_id ? { ...a, pinned: artist.pinned } : a,
        ),
      );

      toast.error(error instanceof Error ? error.message : "Failed to toggle artist pin");
    } finally {
      setIsPinning(false);
    }
  };

  return {
    handlePinToggle,
    isPinning,
  };
};
