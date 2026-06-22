"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, ExternalLink, Disc3, ListMusic } from "lucide-react";
import { SpotifyAlbum, SpotifyTrack } from "@/types/spotify";
import { formatDuration } from "@/lib/spotify/formatDuration";
import { cn } from "@/lib/utils";
import Link from "next/link";
import SpotifyAlbumWithTracksHero from "./SpotifyAlbumWithTracksHero";
import { toolCardMotion } from "./shared/toolCardTokens";
import { ToolCard } from "./shared/ToolCard";
import { ToolEmpty } from "./shared/ToolEmpty";

interface GetSpotifyAlbumWithTracksResultProps {
  result: SpotifyAlbum;
}

// Spotify brand green for the play / now-playing accent.
const SPOTIFY_GREEN = "#1DB954";

// Cascade the rows in after the hero settles, so the record "loads."
const rowsStagger = {
  hidden: {},
  show: { transition: { delayChildren: 0.18, staggerChildren: 0.035 } },
};

const rowItem = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0 },
};

/**
 * A purely decorative equalizer flourish shown on the hovered row. CSS/transform
 * only — there is no audio; it simply signals the "now playing" affordance.
 */
const Equalizer = () => (
  <span
    className="hidden h-3 items-end gap-[2px] group-hover:flex"
    aria-hidden
    style={{ color: SPOTIFY_GREEN }}
  >
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-[2px] rounded-full bg-current"
        initial={{ height: "30%" }}
        animate={{ height: ["30%", "100%", "45%", "85%", "30%"] }}
        transition={{
          duration: 0.9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.12,
        }}
      />
    ))}
  </span>
);

const TrackRow = ({ track }: { track: SpotifyTrack }) => {
  const spotifyUrl = track.external_urls?.spotify;
  const popularity =
    "popularity" in track && typeof (track as { popularity?: number }).popularity === "number"
      ? (track as { popularity?: number }).popularity
      : undefined;

  const rowContent = (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60 sm:px-3",
        spotifyUrl && "cursor-pointer",
      )}
    >
      {/* Track Number swaps to a play affordance on hover (player feel). */}
      <div className="relative flex w-5 items-center justify-center text-center">
        <span className="text-xs tabular-nums text-muted-foreground group-hover:opacity-0">
          {track.track_number}
        </span>
        <Play
          className="absolute size-3 fill-current opacity-0 transition-opacity group-hover:opacity-100"
          style={{ color: SPOTIFY_GREEN }}
          aria-hidden
        />
      </div>

      {/* Track Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-foreground">
            {track.name}
          </span>
          {track.explicit && (
            <span className="hidden shrink-0 items-center rounded bg-muted px-1 text-[10px] font-semibold text-muted-foreground sm:inline-flex">
              E
            </span>
          )}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {track.artists.map((artist) => artist.name).join(", ")}
        </div>
        {typeof popularity === "number" && (
          <div
            className="mt-1 h-0.5 w-full max-w-[160px] overflow-hidden rounded-full bg-muted"
            title={`Popularity ${popularity}/100`}
            aria-hidden
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(0, Math.min(100, popularity))}%`,
                backgroundColor: SPOTIFY_GREEN,
              }}
            />
          </div>
        )}
      </div>

      {/* Now-playing equalizer flourish on hover. */}
      <Equalizer />

      {/* Duration */}
      <div className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {formatDuration(track.duration_ms)}
      </div>

      {/* Secondary: open in Spotify. */}
      {spotifyUrl && (
        <div className="hidden text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:block">
          <ExternalLink className="size-3.5" />
        </div>
      )}
    </div>
  );

  return (
    <motion.div variants={rowItem}>
      {spotifyUrl ? (
        <Link
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {rowContent}
        </Link>
      ) : (
        <div className="block">{rowContent}</div>
      )}
    </motion.div>
  );
};

const GetSpotifyAlbumWithTracksResult: React.FC<
  GetSpotifyAlbumWithTracksResultProps
> = ({ result }) => {
  const tracks = result.tracks?.items ?? [];

  if (tracks.length === 0) {
    return (
      <ToolCard
        icon={Disc3}
        tone="success"
        title={result.name || "Album"}
        subtitle="No tracks"
      >
        <ToolEmpty
          icon={ListMusic}
          title="No tracks available"
          description="This album has no playable tracks on Spotify."
        />
      </ToolCard>
    );
  }

  const totalDuration = tracks.reduce(
    (acc, track) => acc + track.duration_ms,
    0,
  );

  return (
    <motion.div
      initial={toolCardMotion.initial}
      animate={toolCardMotion.animate}
      transition={toolCardMotion.transition}
      className="my-4 w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      {/* Hero Section */}
      <SpotifyAlbumWithTracksHero result={result} totalDuration={totalDuration} />

      {/* Track Listing */}
      <div className="border-t border-border/60 p-2 sm:p-3">
        <motion.div
          variants={rowsStagger}
          initial="hidden"
          animate="show"
          className="space-y-0.5"
        >
          {tracks.map((track) => (
            <TrackRow key={track.id} track={track} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GetSpotifyAlbumWithTracksResult;
