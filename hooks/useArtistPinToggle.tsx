import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useUserProvider } from "@/providers/UserProvder";
import saveArtist from "@/lib/saveArtist";
import { ArtistRecord } from "@/types/Artist";

export const useArtistPinToggle = (artist: ArtistRecord | null) => {
  const { userData } = useUserProvider();
  const { getArtists, setArtists } = useArtistProvider();
  const { getAccessToken } = usePrivy();
  const [isPinning, setIsPinning] = useState(false);

  const handlePinToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!artist || !userData?.id || isPinning) return;

    const newPinnedStatus = !artist.pinned;
    const previousPinnedStatus = artist.pinned;

    setArtists((prevArtists: ArtistRecord[]) =>
      prevArtists.map((a: ArtistRecord) =>
        a.account_id === artist.account_id ? { ...a, pinned: newPinnedStatus } : a,
      ),
    );

    setIsPinning(true);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Missing access token");
      }

      await saveArtist(accessToken, artist.account_id, { pinned: newPinnedStatus });

      await getArtists();
    } catch (error) {
      console.error("Error toggling pin:", error);

      setArtists((prevArtists: ArtistRecord[]) =>
        prevArtists.map((a: ArtistRecord) =>
          a.account_id === artist.account_id ? { ...a, pinned: previousPinnedStatus } : a,
        ),
      );
    } finally {
      setIsPinning(false);
    }
  };

  return {
    handlePinToggle,
    isPinning,
  };
};
