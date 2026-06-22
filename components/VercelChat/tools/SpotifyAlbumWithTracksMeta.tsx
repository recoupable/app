import React from "react";
import { Music } from "lucide-react";
import { SpotifyAlbum } from "@/types/spotify";
import { formatDuration } from "@/lib/spotify/formatDuration";
import Link from "next/link";

interface SpotifyAlbumWithTracksMetaProps {
  result: SpotifyAlbum;
  totalDuration: number;
}

// Spotify brand green for the one branded call-to-action.
const SPOTIFY_GREEN = "#1DB954";

const SpotifyAlbumWithTracksMeta: React.FC<SpotifyAlbumWithTracksMetaProps> = ({
  result,
  totalDuration,
}) => {
  const spotifyUrl = result.external_urls?.spotify;
  const releaseYear = result.release_date
    ? new Date(result.release_date).getFullYear()
    : null;
  const popularity =
    typeof result.popularity === "number" ? result.popularity : undefined;

  // Spotify's metadata is icon-free and calm — joined with middots.
  const metaParts: string[] = [];
  if (releaseYear) metaParts.push(String(releaseYear));
  metaParts.push(
    `${result.total_tracks} song${result.total_tracks === 1 ? "" : "s"}`,
  );
  metaParts.push(formatDuration(totalDuration));

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

      {/* Album Meta — calm, icon-free, middot-separated. */}
      <div className="mt-3 text-xs text-white/70">{metaParts.join(" · ")}</div>

      {/* Popularity stat (data already in the payload). */}
      {typeof popularity === "number" && (
        <div className="mt-3 max-w-[220px]">
          <div className="mb-1 flex items-center justify-between text-[11px] text-white/70">
            <span>Popularity</span>
            <span className="tabular-nums">{popularity}/100</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
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

      {spotifyUrl && (
        <div className="mt-4 flex items-center gap-3">
          <Link
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-[1.03] sm:px-6"
            style={{ backgroundColor: SPOTIFY_GREEN }}
          >
            <Music className="size-4" aria-hidden />
            <span className="hidden sm:inline">Listen on Spotify</span>
            <span className="sm:hidden">Listen</span>
          </Link>
        </div>
      )}

      {/* Label and Genres — quiet ghost chips, lighter than before. */}
      {(result.label || (result.genres && result.genres.length > 0)) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {result.label && (
            <span className="inline-flex select-none items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/80">
              {result.label}
            </span>
          )}
          {result.genres?.slice(0, 2).map((genre, index) => (
            <span
              key={index}
              className="inline-flex select-none items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs capitalize text-white/80"
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
