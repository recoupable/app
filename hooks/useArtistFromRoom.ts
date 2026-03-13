import { useEffect, useRef } from "react";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useUserProvider } from "@/providers/UserProvder";
import type { ArtistRecord } from "@/types/Artist";

/**
 * A hook that automatically selects the artist associated with a room.
 *
 * @param roomId - The ID of the room to get the artist for
 */
export function useArtistFromRoom(roomId: string) {
  const { userData } = useUserProvider();
  const { selectedArtist, artists, setSelectedArtist, getArtists } = useArtistProvider();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current || !roomId || !userData?.id) return;
    hasRun.current = true;

    (async () => {
      try {
        const response = await fetch(
          `/api/room/artist?roomId=${encodeURIComponent(roomId)}&accountId=${encodeURIComponent(userData.id)}`,
        );

        if (!response.ok) return;
        const data = await response.json();

        if (data.new_room_id && data.new_room_id !== roomId) {
          window.history.replaceState({}, "", `/chat/${data.new_room_id}`);
        }

        if (!data.artist_id || selectedArtist?.account_id === data.artist_id) return;

        const artistList = artists as ArtistRecord[];
        const artist = artistList.find(a => a.account_id === data.artist_id);

        if (artist) {
          setSelectedArtist(artist);
        } else {
          await getArtists(data.artist_id);
        }
      } catch (error) {
        console.error("Error selecting artist for room:", error);
      }
    })();
  }, [roomId, userData, selectedArtist, artists, setSelectedArtist, getArtists]);
}
