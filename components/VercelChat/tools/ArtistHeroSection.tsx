"use client";

import { CheckCircle2, Calendar, Tag, User } from "lucide-react";
import { formatDate } from "date-fns";
import { ArtistProfile } from "@/lib/supabase/artist/updateArtistProfile";
import ArtistAvatar from "./ArtistAvatar";

/**
 * Compact, token-safe artist identity header used inside success tool cards.
 * Shows the artist avatar, name, label and last-updated. The success line only
 * renders when a `message` is passed, so a parent ToolCard that already owns the
 * confirmation can suppress it (no doubled checkmark/message).
 */
const ArtistHeroSection = ({
  artistProfile,
  message,
}: {
  artistProfile: ArtistProfile;
  message?: string;
}) => {
  const imageUrl = artistProfile?.image;

  return (
    <div className="flex items-center gap-4 p-4">
      {imageUrl ? (
        <ArtistAvatar
          key={imageUrl}
          imageUrl={imageUrl}
          name={artistProfile?.name || "Artist"}
        />
      ) : (
        <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground shadow-sm">
          <User className="size-6 opacity-60" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-lg font-semibold leading-tight text-foreground">
          {artistProfile?.name || "Artist"}
        </h2>

        {message ? (
          <div className="mt-1 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5 shrink-0" />
            <span className="truncate text-xs font-medium">{message}</span>
          </div>
        ) : null}

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {artistProfile?.label ? (
            <span className="flex items-center gap-1">
              <Tag className="size-3" />
              <span className="truncate">{artistProfile.label}</span>
            </span>
          ) : null}
          {artistProfile?.updated_at ? (
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {formatDate(
                new Date(artistProfile.updated_at),
                "MMM d, yyyy, h:mm a",
              )}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ArtistHeroSection;
