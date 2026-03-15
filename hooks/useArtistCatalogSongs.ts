import { useState, useEffect } from "react";
import { useArtistProvider } from "@/providers/ArtistProvider";
import useCatalogSongs from "./useCatalogSongs";

interface UseArtistCatalogSongsOptions {
  catalogId: string;
  pageSize?: number;
  enabled?: boolean;
}

const useArtistCatalogSongs = ({
  catalogId,
  pageSize = 50,
  enabled = true,
}: UseArtistCatalogSongsOptions) => {
  const { selectedArtist } = useArtistProvider();
  const activeArtistName = selectedArtist?.name ?? undefined;

  const [shouldUseArtistFilter, setShouldUseArtistFilter] = useState(!!activeArtistName);

  const effectiveArtistName = shouldUseArtistFilter ? activeArtistName : undefined;

  const queryResult = useCatalogSongs({
    catalogId,
    pageSize,
    enabled,
    artistName: effectiveArtistName,
  });

  useEffect(() => {
    if (
      activeArtistName &&
      shouldUseArtistFilter &&
      queryResult.data?.pages?.[0]?.pagination.total_count === 0
    ) {
      setShouldUseArtistFilter(false);
    }
  }, [queryResult.data, activeArtistName, shouldUseArtistFilter]);

  // Reset when artist changes
  useEffect(() => {
    setShouldUseArtistFilter(!!activeArtistName);
  }, [activeArtistName]);

  return queryResult;
};

export default useArtistCatalogSongs;
