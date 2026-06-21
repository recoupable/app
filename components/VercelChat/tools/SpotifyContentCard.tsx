"use client";

import React from "react";
import { ExternalLink, Music } from "lucide-react";
import Link from "next/link";
import { getSpotifyImage } from "@/lib/spotify/getSpotifyImage";
import {
  getSpotifySubtitle,
  type SpotifyContent,
} from "@/lib/spotify/spotifyContentUtils";
import { cn } from "@/lib/utils";

interface SpotifyContentCardProps {
  content: SpotifyContent;
}

const SpotifyContentCard = ({ content }: SpotifyContentCardProps) => {
  const imageUrl = getSpotifyImage(content);
  const subtitle = getSpotifySubtitle(content);
  const spotifyUrl = content.external_urls?.spotify;
  const hasValidUrl = Boolean(spotifyUrl && spotifyUrl !== "#");
  // Artists are circular on Spotify; everything else is a rounded square.
  const isArtist = content.type === "artist";

  const cardContent = (
    <div
      className={cn(
        "group/card flex h-full flex-col gap-2 rounded-xl p-2 transition-colors",
        hasValidUrl && "hover:bg-muted/60",
      )}
    >
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden bg-muted shadow-sm",
          isArtist ? "rounded-full" : "rounded-xl",
        )}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={content.name || "Spotify cover"}
            className={cn(
              "h-full w-full object-cover transition-transform duration-300",
              hasValidUrl && "group-hover/card:scale-105",
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Music className="size-6" aria-hidden />
          </div>
        )}
        {hasValidUrl && (
          <div className="absolute bottom-2 right-2 translate-y-1 opacity-0 transition-all duration-200 group-hover/card:translate-y-0 group-hover/card:opacity-100">
            <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
              <ExternalLink className="size-4" />
            </div>
          </div>
        )}
      </div>
      <div className={cn("min-w-0 px-1", isArtist && "text-center")}>
        <h4 className="truncate text-sm font-medium text-foreground">
          {content.name}
        </h4>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  if (hasValidUrl) {
    return (
      <Link
        href={spotifyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default SpotifyContentCard;
