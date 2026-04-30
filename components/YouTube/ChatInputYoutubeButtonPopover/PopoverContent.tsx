import type { YouTubeChannelItem } from "@/hooks/useYoutubeChannel";
import formatFollowerCount from "@/lib/utils/formatFollowerCount";
import { Youtube, Eye, Video } from "lucide-react";
import StatCard from "./StatCard";

export const PopoverContent = ({
  channel,
}: {
  channel?: YouTubeChannelItem;
}) => {
  const title = channel?.snippet?.title;
  const description = channel?.snippet?.description;
  const customUrl = channel?.snippet?.customUrl;
  const thumbnails = channel?.snippet?.thumbnails;
  const statistics = channel?.statistics;

  return (
    <div className="w-56 md:w-80 p-0 rounded-lg md:rounded-xl overflow-hidden bg-card border border-border shadow-lg">
      {channel ? (
        <div className="bg-card">
          <div className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 border-b border-border">
            <img
              src="/brand-logos/youtube.png"
              alt="YouTube"
              className="h-4 w-4 md:h-5 md:w-5"
            />
            <span className="font-medium text-foreground text-xs md:text-sm">
              YouTube Channel
            </span>
          </div>

          <div className="p-3 md:p-4">
            <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-4">
              <img
                src={
                  thumbnails?.high?.url ||
                  thumbnails?.medium?.url ||
                  thumbnails?.default?.url ||
                  ""
                }
                alt={title || "YouTube Channel"}
                className="h-8 w-8 md:h-16 md:w-16 rounded-full object-cover border border-border md:border-2"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium md:font-semibold text-foreground text-sm md:text-base truncate">
                  {title}
                </h3>
                {customUrl && (
                  <p className="text-red-600 text-xs md:text-sm font-medium">
                    {customUrl}
                  </p>
                )}
                {description && (
                  <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                    {description.length > 100
                      ? description.slice(0, 100) + "..."
                      : description}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 md:gap-3 mb-2 md:mb-3">
              <StatCard
                icon={Youtube}
                label="Subscribers"
                value={formatFollowerCount(
                  Number(statistics?.subscriberCount || "0"),
                )}
              />
              <StatCard
                icon={Video}
                label="Videos"
                value={formatFollowerCount(
                  Number(statistics?.videoCount || "0"),
                )}
              />
              <div className="col-span-2">
                <StatCard
                  icon={Eye}
                  label="Total Views"
                  value={formatFollowerCount(
                    Number(statistics?.viewCount || "0"),
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 md:p-4 text-sm text-muted-foreground flex items-center gap-2">
          <img
            src="/brand-logos/youtube.png"
            alt="YouTube"
            className="h-4 w-4"
          />
          Loading channel info...
        </div>
      )}
    </div>
  );
};
