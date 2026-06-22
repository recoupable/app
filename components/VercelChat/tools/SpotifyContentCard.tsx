"use client";

import React from "react";
import { motion } from "framer-motion";
import { Music, Play } from "lucide-react";
import Link from "next/link";
import { getSpotifyImage } from "@/lib/spotify/getSpotifyImage";
import { isSafeSpotifyUrl } from "@/lib/spotify/isSafeSpotifyUrl";
import {
  getSpotifySubtitle,
  type SpotifyContent,
} from "@/lib/spotify/spotifyContentUtils";
import { cn } from "@/lib/utils";

interface SpotifyContentCardProps {
  content: SpotifyContent;
  /**
   * Optional explicit subtitle that overrides the derived one. Lets callers
   * surface a real label (e.g. a release year on a discography grid) without
   * mutating the underlying content data.
   */
  subtitle?: string;
}

// Spotify's brand green (#1DB954) used only for the play affordance accent.
const SPOTIFY_GREEN = "#1DB954";

/** Reads popularity (0-100) off content types that carry it, guarding absence. */
const getPopularity = (content: SpotifyContent): number | undefined => {
  if ("popularity" in content && typeof content.popularity === "number") {
    return content.popularity;
  }
  return undefined;
};

/** Reads a follower total off artists, guarding absence. */
const getFollowers = (content: SpotifyContent): number | undefined => {
  if (
    content.type === "artist" &&
    content.followers &&
    typeof content.followers.total === "number"
  ) {
    return content.followers.total;
  }
  return undefined;
};

const cardItemMotion = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

const SpotifyContentCard = ({ content, subtitle }: SpotifyContentCardProps) => {
  const imageUrl = getSpotifyImage(content);
  const resolvedSubtitle = subtitle ?? getSpotifySubtitle(content);
  const spotifyUrl = content.external_urls?.spotify;
  const safeSpotifyUrl = isSafeSpotifyUrl(spotifyUrl) ? spotifyUrl : undefined;
  const hasValidUrl = Boolean(safeSpotifyUrl);
  // Artists are circular on Spotify; everything else is a rounded square.
  const isArtist = content.type === "artist";
  // Tracks lead with a play verb; albums/artists open the page.
  const isTrack = content.type === "track";

  const popularity = getPopularity(content);
  const followers = getFollowers(content);

  const cardContent = (
    <motion.div
      variants={cardItemMotion}
      className={cn(
        "group/card flex h-full flex-col gap-2 rounded-xl p-2 transition-colors",
        hasValidUrl && "hover:bg-muted/60",
      )}
    >
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden bg-muted shadow-sm transition-shadow duration-200 group-hover/card:shadow-lg",
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
              hasValidUrl &&
                "group-hover/card:scale-105 group-active/card:scale-100",
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Music className="size-6" aria-hidden />
          </div>
        )}
        {hasValidUrl && (
          <div className="absolute bottom-2 right-2 translate-y-1 opacity-0 transition-all duration-200 group-hover/card:translate-y-0 group-hover/card:opacity-100">
            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className="flex size-9 items-center justify-center rounded-full text-black shadow-lg"
              style={{ backgroundColor: SPOTIFY_GREEN }}
            >
              {/* Tracks read "play"; everything else still gets the music glyph. */}
              {isTrack ? (
                <Play className="size-4 fill-current" aria-hidden />
              ) : (
                <Music className="size-4" aria-hidden />
              )}
            </motion.div>
          </div>
        )}
      </div>
      <div className={cn("min-w-0 px-1", isArtist && "text-center")}>
        <h4 className="truncate text-sm font-medium text-foreground">
          {content.name}
        </h4>
        {resolvedSubtitle && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {resolvedSubtitle}
          </p>
        )}
        {typeof followers === "number" && (
          <p className="mt-0.5 truncate text-[11px] tabular-nums text-muted-foreground/80">
            {followers.toLocaleString()} followers
          </p>
        )}
        {typeof popularity === "number" && (
          <div
            className={cn("mt-1.5", isArtist && "mx-auto max-w-[80%]")}
            title={`Popularity ${popularity}/100`}
            aria-label={`Popularity ${popularity} out of 100`}
          >
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(0, Math.min(100, popularity))}%`,
                  backgroundColor: SPOTIFY_GREEN,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  if (safeSpotifyUrl) {
    return (
      <Link
        href={safeSpotifyUrl}
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
