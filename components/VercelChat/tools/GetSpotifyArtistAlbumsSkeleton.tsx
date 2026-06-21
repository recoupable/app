import React from "react";
import { Disc3 } from "lucide-react";
import { ToolCard, ToolCardBody } from "./shared/ToolCard";

const GetSpotifyArtistAlbumsSkeleton: React.FC = () => {
  const skeletonItems = Array.from({ length: 8 }, (_, i) => i);

  return (
    <ToolCard
      icon={Disc3}
      tone="success"
      loading
      title="Artist albums"
      subtitle="Loading releases…"
    >
      <ToolCardBody>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4">
          {skeletonItems.map((item) => (
            <div key={item} className="flex flex-col gap-2 p-2">
              <div className="aspect-square w-full animate-pulse rounded-xl bg-muted" />
              <div className="space-y-1.5 px-1">
                <div className="h-3.5 w-3/4 animate-pulse rounded-md bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded-md bg-muted/70" />
              </div>
            </div>
          ))}
        </div>
      </ToolCardBody>
    </ToolCard>
  );
};

export default GetSpotifyArtistAlbumsSkeleton;
