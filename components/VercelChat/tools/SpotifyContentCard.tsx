import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getSafeSpotifyUrl } from "@/lib/spotify/getSafeSpotifyUrl";
import { getSpotifyImage } from "@/lib/spotify/getSpotifyImage";
import {
  getSpotifySubtitle,
  type SpotifyContent,
} from "@/lib/spotify/spotifyContentUtils";

interface SpotifyContentCardProps {
  content: SpotifyContent;
}

const SpotifyContentCard = ({ content }: SpotifyContentCardProps) => {
  const imageUrl = getSpotifyImage(content);
  const subtitle = getSpotifySubtitle(content);
  const safeSpotifyUrl = getSafeSpotifyUrl(content.external_urls?.spotify);

  const cardContent = (
    <Card
      className={cn(
        "overflow-hidden border-0 bg-transparent rounded-xl transition-colors h-full",
        safeSpotifyUrl && "hover:bg-black/5 group",
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={content.name || "Content cover"}
            className={cn(
              "h-full w-full object-cover transition-transform duration-300",
              safeSpotifyUrl && "group-hover:scale-105",
            )}
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}
        {safeSpotifyUrl && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-[#1DB954] rounded-full p-2 shadow-lg">
              <ExternalLink className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <h4 className="font-medium text-sm line-clamp-1">{content.name}</h4>
        {subtitle && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (safeSpotifyUrl) {
    return (
      <Link
        href={safeSpotifyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default SpotifyContentCard;
