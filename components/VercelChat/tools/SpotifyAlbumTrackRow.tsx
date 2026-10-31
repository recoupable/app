import { Badge } from "@/components/ui/badge";
import { Play, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { SpotifyTrack } from "@/types/spotify";
import { formatDuration } from "@/lib/spotify/formatDuration";
import { getSafeSpotifyUrl } from "@/lib/spotify/getSafeSpotifyUrl";
import { cn } from "@/lib/utils";

interface SpotifyAlbumTrackRowProps {
  track: SpotifyTrack;
}

export default function SpotifyAlbumTrackRow({
  track,
}: SpotifyAlbumTrackRowProps) {
  const spotifyUrl = getSafeSpotifyUrl(track.external_urls?.spotify);
  const content = (
    <div
      role="group"
      aria-label={track.name}
      className={cn(
        "flex min-h-11 items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-xl transition-colors",
        spotifyUrl && "hover:bg-white/10",
      )}
    >
      <div className="w-4 sm:w-5 text-center">
        <span
          className={cn(
            "text-muted-foreground text-xs",
            spotifyUrl && "group-hover:hidden",
          )}
        >
          {track.track_number}
        </span>
        {spotifyUrl && (
          <Play className="w-3 h-3 text-white hidden group-hover:block" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white text-sm truncate">
            {track.name}
          </span>
          {track.explicit && (
            <Badge
              variant="secondary"
              className="bg-muted text-muted-foreground text-xs px-1 py-0 inline-flex"
            >
              E
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {track.artists.map((artist) => artist.name).join(", ")}
        </div>
      </div>
      <div className="text-xs text-muted-foreground min-w-0">
        {formatDuration(track.duration_ms)}
      </div>
      {spotifyUrl && (
        <div className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity hidden sm:block text-muted-foreground">
          <ExternalLink className="w-3 h-3" />
        </div>
      )}
    </div>
  );
  return spotifyUrl ? (
    <Link
      href={spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      {content}
    </Link>
  ) : (
    content
  );
}
