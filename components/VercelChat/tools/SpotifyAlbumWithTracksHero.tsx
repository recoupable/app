import React from "react";
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
      {/* Blurred album-art backdrop with a darkening gradient for legibility */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
          aria-hidden
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80" />
        </div>
      )}
      {!backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-zinc-950" />
      )}

      {/* Content Overlay */}
      <div className="relative z-10 p-4 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          {/* Album Cover */}
          <div className="shrink-0">
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
          </div>

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
