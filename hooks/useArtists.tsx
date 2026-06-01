import { useUserProvider } from "@/providers/UserProvder";
import { useOrganization } from "@/providers/OrganizationProvider";
import { ArtistRecord } from "@/types/Artist";
import { useCallback, useMemo, useState } from "react";
import useArtistSetting from "./useArtistSetting";
import useArtistMode from "./useArtistMode";
import saveArtist from "@/lib/saveArtist";
import useCreateArtists from "./useCreateArtists";
import { useArtistSelection } from "./artists/useArtistSelection";
import { usePrivy } from "@privy-io/react-auth";
import { fetchArtists } from "@/lib/artists/fetchArtists";
import { sortArtistsWithPinnedFirst } from "@/lib/artists/sortArtistsWithPinnedFirst";
import { useQuery, useQueryClient } from "@tanstack/react-query";

/** Roster via react-query; selection delegated to `useArtistSelection`. */
const useArtists = () => {
  const artistSetting = useArtistSetting();
  const { userData } = useUserProvider();
  const { selectedOrgId } = useOrganization();
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();
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

  const artistsQueryKey = useMemo(
    () => ["artists", userData?.id, selectedOrgId] as const,
    [userData?.id, selectedOrgId],
  );

  const { data: artists = [], isLoading } = useQuery({
    queryKey: artistsQueryKey,
    queryFn: async () => {
      const accessToken = await getAccessToken();
      // Throw rather than resolve to `[]` so `isLoading` stays true on
      // a transient missing token — otherwise `useNewChatBootstrap`
      // would see "settled, empty roster" and POST with
      // `artistId: undefined`.
      if (!accessToken) throw new Error("Missing Privy access token");
      return fetchArtists(accessToken, selectedOrgId);
    },
    enabled: !!userData?.id,
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

  // Mirrors `setState` so `setArtists(list)` and `setArtists(prev => ...)` both work.
  const setArtists = useCallback(
    (next: ArtistRecord[] | ((prev: ArtistRecord[]) => ArtistRecord[])) => {
      queryClient.setQueryData<ArtistRecord[]>(artistsQueryKey, (prev) =>
        typeof next === "function" ? next(prev ?? []) : next,
      );
    },
    [queryClient, artistsQueryKey],
  );

  const getArtists = useCallback(
    async (artistId?: string) => {
      if (!userData?.id) return;

      const fresh = await queryClient.fetchQuery({
        queryKey: artistsQueryKey,
        queryFn: async () => {
          const accessToken = await getAccessToken();
          if (!accessToken) throw new Error("Missing Privy access token");
          return fetchArtists(accessToken, selectedOrgId);
        },
      });

      if (artistId) {
        const found = fresh.find((a) => a.account_id === artistId);
        if (found) setSelectedArtist(found);
      }
    },
    [
      userData?.id,
      selectedOrgId,
      getAccessToken,
      queryClient,
      artistsQueryKey,
      setSelectedArtist,
    ],
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
