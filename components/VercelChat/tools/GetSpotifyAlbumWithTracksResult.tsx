"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, ExternalLink, Disc3, ListMusic } from "lucide-react";
import { SpotifyAlbum } from "@/types/spotify";
import { formatDuration } from "@/lib/spotify/formatDuration";
import Link from "next/link";
import SpotifyAlbumWithTracksHero from "./SpotifyAlbumWithTracksHero";
import { toolCardMotion } from "./shared/toolCardTokens";
import { ToolCard, ToolCardBody } from "./shared/ToolCard";
import ToolEmpty from "./shared/ToolEmpty";

interface GetSpotifyAlbumWithTracksResultProps {
  result: SpotifyAlbum;
}

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
        <div className="space-y-0.5">
          {tracks.map((track) => (
            <Link
              href={track.external_urls.spotify}
              key={track.id}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="group flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60 sm:px-3">
                {/* Track Number / Play */}
                <div className="w-5 text-center">
                  <span className="text-xs text-muted-foreground group-hover:hidden">
                    {track.track_number}
                  </span>
                  <Play className="mx-auto hidden size-3 text-foreground group-hover:block" />
                </div>

                {/* Track Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
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
                </div>

                {/* Duration */}
                <div className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {formatDuration(track.duration_ms)}
                </div>

                {/* External link affordance */}
                {track.external_urls?.spotify && (
                  <div className="hidden text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:block">
                    <ExternalLink className="size-3.5" />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default GetSpotifyAlbumWithTracksResult;
