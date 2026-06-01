import { useUserProvider } from "@/providers/UserProvder";
import { useOrganization } from "@/providers/OrganizationProvider";
import { ArtistRecord } from "@/types/Artist";
import { useCallback, useMemo, useState } from "react";
import useArtistSetting from "./useArtistSetting";
import useArtistMode from "./useArtistMode";
import saveArtist from "@/lib/saveArtist";
import useCreateArtists from "./useCreateArtists";
import { usePrivy } from "@privy-io/react-auth";
import { fetchArtists } from "@/lib/artists/fetchArtists";
import { sortArtistsWithPinnedFirst } from "@/lib/artists/sortArtistsWithPinnedFirst";
import { useLocalStorage } from "usehooks-ts";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type ArtistSelections = Record<string, ArtistRecord>;

/** Roster via react-query; selection derived from (artists, saved, orgKey, override). */
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

  const [selections, setSelections] = useLocalStorage<ArtistSelections>(
    "RECOUP_ARTIST_SELECTIONS",
    {},
  );

  // Explicit pick/deselect for this session. null means user-deselected
  // (saved selection ignored); undefined means user hasn't interacted.
  const [userOverride, setUserOverride] = useState<{
    orgKey: string;
    artist: ArtistRecord | null;
  } | null>(null);

  const artistsQueryKey = useMemo(
    () => ["artists", userData?.id, selectedOrgId] as const,
    [userData?.id, selectedOrgId],
  );

  const { data: artists = [], isLoading } = useQuery({
    queryKey: artistsQueryKey,
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) return [];
      return fetchArtists(accessToken, selectedOrgId);
    },
    enabled: !!userData?.id,
  });

  // Precedence: override → saved → artists[0]. Re-look-up in fresh
  // `artists` so we surface latest server-side fields, not snapshots.
  const selectedArtist = useMemo<ArtistRecord | null>(() => {
    if (userOverride && userOverride.orgKey === orgKey) {
      if (!userOverride.artist) return null;
      return (
        artists.find((a) => a.account_id === userOverride.artist!.account_id) ??
        null
      );
    }
    if (artists.length === 0) return null;
    const saved = selections[orgKey];
    if (saved && Object.keys(saved).length > 0) {
      const found = artists.find((a) => a.account_id === saved.account_id);
      if (found) return found;
    }
    return artists[0];
  }, [artists, selections, orgKey, userOverride]);

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

  const setSelectedArtist = useCallback(
    (artist: ArtistRecord | null) => {
      setUserOverride({ orgKey, artist });
      if (artist) {
        setSelections((prev) => ({ ...prev, [orgKey]: artist }));
      } else {
        setSelections((prev) => {
          const next = { ...prev };
          delete next[orgKey];
          return next;
        });
      }
    },
    [orgKey, setSelections],
  );

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
          if (!accessToken) return [];
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
