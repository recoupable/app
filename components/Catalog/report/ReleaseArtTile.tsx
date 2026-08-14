"use client";

import Image from "next/image";
import useAlbumArtwork from "@/hooks/useAlbumArtwork";

interface ReleaseArtTileProps {
  album: string | null;
  artistName?: string;
}

/**
 * Album art for a release row, resolved best-effort via Spotify search.
 * Missing metadata or a lookup miss falls back to an achromatic initial tile —
 * never a broken image, never a crash.
 */
const ReleaseArtTile = ({ album, artistName }: ReleaseArtTileProps) => {
  const { data: artworkUrl } = useAlbumArtwork(album, artistName);

  if (artworkUrl) {
    return (
      <Image
        src={artworkUrl}
        alt={album ? `${album} album art` : "Album art"}
        width={40}
        height={40}
        unoptimized
        className="h-10 w-10 rounded-md object-cover shadow-[0_0_0_1px_var(--border)]"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="flex h-10 w-10 items-center justify-center rounded-md bg-muted font-heading text-sm text-muted-foreground shadow-[0_0_0_1px_var(--border)]"
    >
      {album?.trim()?.charAt(0)?.toUpperCase() || "♪"}
    </div>
  );
};

export default ReleaseArtTile;
