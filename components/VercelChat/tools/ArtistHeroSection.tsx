import React from "react";
import { CheckCircle2, Calendar, Tag } from "lucide-react";
import { formatDate } from "date-fns";
import { ArtistProfile } from "@/lib/supabase/artist/updateArtistProfile";

/**
 * Compact, token-safe artist identity header used inside success tool cards.
 * Shows the artist avatar, name, a success confirmation, label and last-updated.
 */
const ArtistHeroSection = ({
  artistProfile,
  message,
}: {
  artistProfile: ArtistProfile;
  message?: string;
}) => {
  return (
    <div className="flex items-center gap-4 p-4">
      {artistProfile?.image ? (
        <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-muted shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artistProfile.image}
            alt={artistProfile?.name || "Artist"}
            className="size-full object-cover"
          />
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-lg font-semibold leading-tight text-foreground">
          {artistProfile?.name || "Artist"}
        </h2>

        <div className="mt-1 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-3.5 shrink-0" />
          <span className="truncate text-xs font-medium">
            {message || "Profile updated successfully"}
          </span>
        </div>

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
