import { useUserProvider } from "@/providers/UserProvder";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useCallback, useMemo, useState } from "react";
import useArtistSetting from "./useArtistSetting";
import useArtistMode from "./useArtistMode";
import saveArtist from "@/lib/saveArtist";
import useCreateArtists from "./useCreateArtists";
import { useArtistSelection } from "./artists/useArtistSelection";
import { useArtistsRoster } from "./artists/useArtistsRoster";
import { usePrivy } from "@privy-io/react-auth";
import { sortArtistsWithPinnedFirst } from "@/lib/artists/sortArtistsWithPinnedFirst";

/** Composes the roster (`useArtistsRoster`) + selection (`useArtistSelection`) + per-artist settings. */
const useArtists = () => {
  const artistSetting = useArtistSetting();
  const { userData } = useUserProvider();
  const { selectedOrgId } = useOrganization();
  const { getAccessToken } = usePrivy();
  const [updating, setUpdating] = useState(false);
  const [menuVisibleArtistId, setMenuVisibleArtistId] = useState<any>("");
  const { isCreatingArtist, setIsCreatingArtist, updateChatState } =
    useCreateArtists();
  const loading = artistSetting.imageUploading || updating;
  const artistMode = useArtistMode(
    artistSetting.clearParams,
    artistSetting.setEditableArtist,
  );

  const orgKey = selectedOrgId || "personal";

  const { artists, isLoading, setArtists, refetchArtists } = useArtistsRoster({
    userId: userData?.id,
    orgId: selectedOrgId,
  });

  const { selectedArtist, setSelectedArtist } = useArtistSelection(
    orgKey,
    artists,
  );

  const sorted = useMemo(() => {
    if (!selectedArtist) {
      return sortArtistsWithPinnedFirst(artists);
    }
    const selectedIndex = artists.findIndex(
      (artist) => artist.account_id === selectedArtist.account_id,
    );
    if (selectedIndex === -1) {
      return sortArtistsWithPinnedFirst(artists);
    }
    const rest = [
      ...artists.slice(0, selectedIndex),
      ...artists.slice(selectedIndex + 1),
    ];
    return [selectedArtist, ...sortArtistsWithPinnedFirst(rest)];
  }, [artists, selectedArtist]);

  // Imperative refresh + optional select-by-id. Used after create/update.
  const getArtists = useCallback(
    async (artistId?: string) => {
      if (!userData?.id) return;
      const fresh = await refetchArtists();
      if (artistId) {
        const found = fresh.find((a) => a.account_id === artistId);
        if (found) setSelectedArtist(found);
      }
    },
    [userData?.id, refetchArtists, setSelectedArtist],
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

  return {
    sorted,
    artists,
    setArtists,
    selectedArtist,
    setSelectedArtist,
    getArtists,
    updating,
    loading,
    saveSetting,
    ...artistSetting,
    ...artistMode,
    setMenuVisibleArtistId,
    menuVisibleArtistId,
    isLoading,
    isCreatingArtist,
    setIsCreatingArtist,
    updateChatState,
  };
};

export default useArtists;
