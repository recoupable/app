import { useArtistProvider } from "@/providers/ArtistProvider";
import { useArtistFans } from "@/hooks/useArtistFans";
import { type Social } from "@/types/Social";
import { type FansResponse } from "@/lib/fans/fetchArtistFans";
import Fans from "./Fans";
import FansSkeleton from "./FansSkeleton";
import { useCallback } from "react";
import { type InfiniteData } from "@tanstack/react-query";

const FANS_PER_PAGE = 20;

const FansWrapper = () => {
  const { selectedArtist } = useArtistProvider();
  const { data, isLoading, error, isFetchingNextPage } = useArtistFans(
    selectedArtist?.account_id,
    FANS_PER_PAGE
  );

  const processAllFans = useCallback(() => {
    if (!data) return { fansWithAvatars: [], fansWithoutAvatars: [] };

    const fansWithAvatars: Social[] = [];
    const fansWithoutAvatars: Social[] = [];

    const infiniteData = data as unknown as InfiniteData<FansResponse>;
    infiniteData.pages.forEach((page) => {
      if (!page.fans || !Array.isArray(page.fans)) return;

      page.fans.forEach((fan) => {
        if (!fan || typeof fan !== "object") return;

        if (fan.avatar) {
          fansWithAvatars.push(fan);
        } else {
          fansWithoutAvatars.push(fan);
        }
      });
    });

    const sortedFansWithAvatars = [...fansWithAvatars].sort(
      (a, b) => (b.follower_count ?? 0) - (a.follower_count ?? 0)
    );
    const sortedFansWithoutAvatars = [...fansWithoutAvatars].sort(
      (a, b) => (b.follower_count ?? 0) - (a.follower_count ?? 0)
    );

    return {
      fansWithAvatars: sortedFansWithAvatars,
      fansWithoutAvatars: sortedFansWithoutAvatars,
    };
  }, [data]);

  const { fansWithAvatars, fansWithoutAvatars } = processAllFans();

  if (!selectedArtist || isLoading) {
    return <FansSkeleton />;
  }

  if (error) {
    return (
      <div className="text-lg text-center text-red-500 dark:text-red-400 py-8">
        Failed to load fans: {error.message}
      </div>
    );
  }

  if (!fansWithAvatars.length && !fansWithoutAvatars.length) {
    return (
      <div className="text-lg text-center py-8 dark:text-white">
        No fans found for this artist.
      </div>
    );
  }

  return (
    <Fans
      fansWithAvatars={fansWithAvatars}
      fansWithoutAvatars={fansWithoutAvatars}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
};

export default FansWrapper;
