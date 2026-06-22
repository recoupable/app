"use client";

import React from "react";
import { motion } from "framer-motion";
import { Music } from "lucide-react";
import { SpotifyAlbum } from "@/types/spotify";
import SpotifyAlbumWithTracksMeta from "./SpotifyAlbumWithTracksMeta";

interface SpotifyAlbumWithTracksHeroProps {
  result: SpotifyAlbum;
  totalDuration: number;
}

const SpotifyAlbumWithTracksHero: React.FC<SpotifyAlbumWithTracksHeroProps> = ({
  result,
  totalDuration,
}) => {
  const backgroundImage = result.images?.[0]?.url;

  return (
    <div className="relative isolate overflow-hidden">
      {/* Blurred album-art backdrop. Lighter scrim lets the artwork's hue
          survive so each release feels like itself. */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
          aria-hidden
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/75" />
        </div>
      )}
      {!backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-zinc-950" />
      )}

      {/* Content Overlay */}
      <div className="relative z-10 p-4 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          {/* Album Cover — moves once, gracefully, as the record loads. */}
          <motion.div
            className="shrink-0"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {backgroundImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={backgroundImage}
                alt={`${result.name} album cover`}
                className="size-32 rounded-xl object-cover shadow-2xl ring-1 ring-white/10 sm:size-48"
              />
            ) : (
              <div className="flex size-32 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10 sm:size-48">
                <Music className="size-12 text-white/40 sm:size-16" />
              </div>
            )}
          </motion.div>

          {/* Album Info */}
          <SpotifyAlbumWithTracksMeta
            result={result}
            totalDuration={totalDuration}
          />
        </div>
      </div>
    </div>
  );
};

export default SpotifyAlbumWithTracksHero;
