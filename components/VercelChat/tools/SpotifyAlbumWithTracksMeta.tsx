import React from "react";
import { Calendar, Clock, Music, ExternalLink } from "lucide-react";
import { SpotifyAlbum } from "@/types/spotify";
import { formatDuration } from "@/lib/spotify/formatDuration";
import Link from "next/link";

interface SpotifyAlbumWithTracksMetaProps {
  result: SpotifyAlbum;
  totalDuration: number;
}

const SpotifyAlbumWithTracksMeta: React.FC<SpotifyAlbumWithTracksMetaProps> = ({
  result,
  totalDuration,
}) => {
  const spotifyUrl = result.external_urls?.spotify;
  const releaseYear = result.release_date
    ? new Date(result.release_date).getFullYear()
    : null;

  return (
    <div className="min-w-0 flex-1 text-white">
      {result.album_type && (
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex select-none items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium capitalize text-white backdrop-blur-sm">
            {result.album_type}
          </span>
        </div>
      )}

      <h1 className="line-clamp-2 text-2xl font-bold leading-tight drop-shadow-lg sm:text-4xl sm:font-semibold">
        {result.name}
      </h1>

      <div className="mt-2 flex items-center gap-2 text-sm sm:text-base">
        <span className="truncate font-medium text-white/90">
          {result.artists.map((artist) => artist.name).join(", ")}
        </span>
      </div>

      {/* Album Meta */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-white/70">
        {releaseYear && (
          <div className="flex items-center gap-1">
            <Calendar className="size-3" />
            {releaseYear}
          </div>
        )}
        <div className="flex items-center gap-1">
          <Music className="size-3" />
          {result.total_tracks} song{result.total_tracks === 1 ? "" : "s"}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="size-3" />
          {formatDuration(totalDuration)}
        </div>
      </div>

      {spotifyUrl && (
        <div className="mt-4 flex items-center gap-3">
          <Link
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 sm:px-6"
          >
            <ExternalLink className="size-4" />
            <span className="hidden sm:inline">Listen on Spotify</span>
            <span className="sm:hidden">Listen</span>
          </Link>
        </div>
      )}

      {/* Label and Genres */}
      {(result.label || (result.genres && result.genres.length > 0)) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {result.label && (
            <span className="inline-flex select-none items-center rounded-full border border-white/30 bg-white/10 px-2.5 py-0.5 text-xs text-white">
              {result.label}
            </span>
          )}
          {result.genres?.slice(0, 2).map((genre, index) => (
            <span
              key={index}
              className="inline-flex select-none items-center rounded-full border border-white/30 bg-white/10 px-2.5 py-0.5 text-xs capitalize text-white"
            >
              {genre}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpotifyAlbumWithTracksMeta;
