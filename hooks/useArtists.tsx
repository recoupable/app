import { useUserProvider } from "@/providers/UserProvder";
import { useOrganization } from "@/providers/OrganizationProvider";
import { ArtistRecord } from "@/types/Artist";
import { useCallback, useEffect, useState } from "react";
import useArtistSetting from "./useArtistSetting";
import { SETTING_MODE } from "@/types/Setting";
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
  const { email, userData } = useUserProvider();
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

  const sorted = (() => {
    if (!selectedArtist) {
      return sortArtistsWithPinnedFirst(artists);
    }

    // Find the selected artist index
    const selectedIndex = artists.findIndex(
      (artist: ArtistRecord) => artist.account_id === selectedArtist.account_id,
    );

    if (selectedIndex === -1) {
      return sortArtistsWithPinnedFirst(artists);
    }

    // Remove selected artist from the list
    const artistsWithoutSelected = [
      ...artists.slice(0, selectedIndex),
      ...artists.slice(selectedIndex + 1),
    ];

    // Sort remaining artists with pinned first
    const sortedRemaining = sortArtistsWithPinnedFirst(artistsWithoutSelected);

    // Selected artist always appears at the top of the list
    return [selectedArtist, ...sortedRemaining];
  })();

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
    const saveMode = artistMode.settingMode;
    try {
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
      const data = await saveArtist({
        name: artistSetting.name,
        image: artistSetting.image,
        profileUrls,
        instruction: artistSetting.instruction,
        label: artistSetting.label,
        knowledges: overrideKnowledges ?? artistSetting.bases,
        artistId:
          saveMode === SETTING_MODE.CREATE
            ? ""
            : artistSetting.editableArtist?.account_id,
        email,
        // Link new artist to selected org (only applies when creating)
        organizationId: saveMode === SETTING_MODE.CREATE ? selectedOrgId : null,
      });
      await getArtists(data.artist?.account_id);
      setUpdating(false);
      if (artistMode.settingMode === SETTING_MODE.CREATE)
        artistMode.setSettingMode(SETTING_MODE.UPDATE);
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
