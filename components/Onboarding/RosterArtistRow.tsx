"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ArtistRecord } from "@/types/Artist";

const RosterArtistRow = ({ artist }: { artist: ArtistRecord }) => {
  const socialsCount = artist.account_socials?.length ?? 0;
  const socialsLabel =
    socialsCount === 0
      ? "No socials matched yet"
      : `${socialsCount} social ${socialsCount === 1 ? "profile" : "profiles"} matched`;

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
      <Avatar>
        {artist.image ? <AvatarImage src={artist.image} alt="" /> : null}
        <AvatarFallback>
          {(artist.name || "?").charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="font-medium text-card-foreground truncate">
          {artist.name || "Untitled artist"}
        </p>
        <p className="text-xs text-muted-foreground">{socialsLabel}</p>
      </div>
    </div>
  );
};

export default RosterArtistRow;
