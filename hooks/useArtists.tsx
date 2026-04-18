import { useUserProvider } from "@/providers/UserProvder";
import { useOrganization } from "@/providers/OrganizationProvider";
import { ArtistRecord } from "@/types/Artist";
import { useCallback, useEffect, useMemo, useState } from "react";
import useArtistSetting from "./useArtistSetting";
import useArtistMode from "./useArtistMode";
import saveArtist from "@/lib/saveArtist";
import useInitialArtists from "./useInitialArtists";
import useCreateArtists from "./useCreateArtists";
import { usePrivy } from "@privy-io/react-auth";
import { fetchArtists } from "@/lib/artists/fetchArtists";
import { sortArtistsWithPinnedFirst } from "@/lib/artists/sortArtistsWithPinnedFirst";

const useArtists = () => {
  const artistSetting = useArtistSetting();
  const [isLoading, setIsLoading] = useState(true);
  const { userData } = useUserProvider();
  const { selectedOrgId } = useOrganization();
  const { getAccessToken } = usePrivy();
  const [artists, setArtists] = useState<ArtistRecord[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<ArtistRecord | null>(
    null,
  );
  const [updating, setUpdating] = useState(false);
  const loading = artistSetting.imageUploading || updating;
  const artistMode = useArtistMode(
    artistSetting.clearParams,
    artistSetting.setEditableArtist,
  );
  const { handleSelectArtist } = useInitialArtists(
    artists,
    selectedArtist,
    setSelectedArtist,
    selectedOrgId,
  );
  const [menuVisibleArtistId, setMenuVisibleArtistId] = useState<any>("");
  const { isCreatingArtist, setIsCreatingArtist, updateChatState } =
    useCreateArtists();

  const sorted = useMemo(() => {
    if (!selectedArtist) {
      return sortArtistsWithPinnedFirst(artists);
    }

    const selectedIndex = artists.findIndex(
      (artist: ArtistRecord) => artist.account_id === selectedArtist.account_id,
    );

    if (selectedIndex === -1) {
      return sortArtistsWithPinnedFirst(artists);
    }

    const artistsWithoutSelected = [
      ...artists.slice(0, selectedIndex),
      ...artists.slice(selectedIndex + 1),
    ];

    const sortedRemaining = sortArtistsWithPinnedFirst(artistsWithoutSelected);

    return [selectedArtist, ...sortedRemaining];
  }, [artists, selectedArtist]);

  const getArtists = useCallback(
    async (artistId?: string) => {
      if (!userData?.id) {
        setArtists([]);
        return;
      }

      const accessToken = await getAccessToken();
      if (!accessToken) {
        setArtists([]);
        return;
      }

      const newArtists = await fetchArtists(accessToken, selectedOrgId);
      setArtists(newArtists);

      if (newArtists.length === 0) {
        setSelectedArtist(null);
        setIsLoading(false);
        return;
      }

      // If specific artistId provided, select it
      if (artistId) {
        const newUpdatedInfo = newArtists.find(
          (artist: ArtistRecord) => artist.account_id === artistId,
        );
        if (newUpdatedInfo) {
          setSelectedArtist(newUpdatedInfo);
          setIsLoading(false);
          return;
        }
      }

      // Check if current selectedArtist is still in the new list
      setSelectedArtist((current) => {
        if (!current) return newArtists[0] || null;
        const stillExists = newArtists.find(
          (a) => a.account_id === current.account_id,
        );
        return stillExists || newArtists[0] || null;
      });

      setIsLoading(false);
    },
    [userData, selectedOrgId, getAccessToken],
  );

  const saveSetting = async (
    overrideKnowledges?: Array<{ name: string; url: string; type: string }>,
  ) => {
    setUpdating(true);
    try {
      const accessToken = await getAccessToken();
      const artistId = artistSetting.editableArtist?.account_id;

      if (!accessToken || !artistId) {
        setUpdating(false);
        return null;
      }

      const profileUrls = {
        TWITTER: artistSetting.twitter,
        TIKTOK: artistSetting.tiktok,
        YOUTUBE: artistSetting.youtube,
        INSTAGRAM: artistSetting.instagram,
        SPOTIFY: artistSetting.spotifyUrl,
        APPLE: artistSetting.appleUrl,
        FACEBOOK: artistSetting.facebook,
        THREADS: artistSetting.threads,
      };
      const data = await saveArtist(accessToken, artistId, {
        name: artistSetting.name,
        image: artistSetting.image,
        profileUrls,
        instruction: artistSetting.instruction,
        label: artistSetting.label,
        knowledges: overrideKnowledges ?? artistSetting.bases,
      });
      await getArtists(data.artist?.account_id);
      setUpdating(false);
      return data.artist;
    } catch (error) {
      console.error(error);
      setUpdating(false);
      return null;
    }
  };

  useEffect(() => {
    getArtists();
  }, [getArtists, userData, selectedOrgId]);

  return {
    sorted,
    artists,
    setArtists,
    selectedArtist,
    setSelectedArtist: handleSelectArtist,
    getArtists,
    updating,
    loading,
    saveSetting,
    ...artistSetting,
    ...artistMode,
    setMenuVisibleArtistId,
    menuVisibleArtistId,
    setIsLoading,
    isLoading,
    isCreatingArtist,
    setIsCreatingArtist,
    updateChatState,
  };
};

export default useArtists;
