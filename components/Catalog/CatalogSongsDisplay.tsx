import CatalogSongsResult from "@/components/VercelChat/tools/catalog/CatalogSongsResult";
import CatalogSongsSkeleton from "@/components/VercelChat/tools/catalog/CatalogSongsSkeleton";
import CatalogSongsInfiniteScrollTrigger from "./CatalogSongsInfiniteScrollTrigger";
import { SongsByIsrcResponse } from "@/lib/catalog/getSongsByIsrc";
import { createSearchResult } from "@/lib/catalog/createSearchResult";
import { createErrorResult } from "@/lib/catalog/createErrorResult";
import { createCatalogResult } from "@/lib/catalog/createCatalogResult";
import useArtistCatalogSongs from "@/hooks/useArtistCatalogSongs";

interface CatalogSongsDisplayProps {
  catalogId: string;
  isSearchMode: boolean;
  searchData?: SongsByIsrcResponse;
  searchLoading: boolean;
  searchError: Error | null;
  activeIsrc: string;
}

const CatalogSongsDisplay = ({
  catalogId,
  isSearchMode,
  searchData,
  searchLoading,
  searchError,
  activeIsrc,
}: CatalogSongsDisplayProps) => {
  const { data, isLoading, error, isFetchingNextPage, observerTarget } =
    useArtistCatalogSongs({
      catalogId,
      pageSize: 50,
      enabled: !isSearchMode,
    });

  const currentLoading = isSearchMode ? searchLoading : isLoading;
  const currentError = isSearchMode ? searchError : error;

  if (currentLoading) {
    return <CatalogSongsSkeleton />;
  }

  // Handle ISRC search results
  if (isSearchMode && searchData) {
    return (
      <CatalogSongsResult
        catalogId={catalogId}
        result={createSearchResult(searchData, catalogId, activeIsrc)}
      />
    );
  }

  // Handle errors
  if (currentError || !data || !data.pages || data.pages.length === 0) {
    return (
      <CatalogSongsResult
        catalogId={catalogId}
        result={createErrorResult(currentError)}
      />
    );
  }

  // Normal catalog view
  return (
    <>
      <CatalogSongsResult
        catalogId={catalogId}
        result={createCatalogResult(data.pages)}
      />
      <CatalogSongsInfiniteScrollTrigger
        observerTarget={observerTarget}
        isFetchingNextPage={isFetchingNextPage}
      />
    </>
  );
};

export default CatalogSongsDisplay;
