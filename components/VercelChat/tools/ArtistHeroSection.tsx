import React from "react";
import { CheckCircle, Calendar, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "date-fns";
import { ArtistProfile } from "@/lib/supabase/artist/updateArtistProfile";

const ArtistHeroSection = ({
  artistProfile,
  message,
}: {
  artistProfile: ArtistProfile;
  message?: string;
}) => {
  return (
    <div className="relative">
      {artistProfile.image && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url(${artistProfile.image})`,
          }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
          {artistProfile.image && (
            <div className="flex-shrink-0">
              <Avatar
                key={artistProfile.image}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg shadow-2xl"
              >
                <AvatarImage
                  src={artistProfile.image}
                  alt={artistProfile.name || "Artist"}
                  className="object-cover"
                />
                <AvatarFallback
                  className="rounded-lg bg-[var(--muted)]"
                  role="img"
                  aria-label={artistProfile.name || "Artist"}
                >
                  <User
                    className="h-8 w-8 text-muted-foreground"
                    aria-hidden="true"
                  />
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white mb-2 leading-tight">
              {artistProfile.name}
            </h1>

            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-400 text-sm font-medium">
                {message || "Profile Updated Successfully!"}
              </span>
            </div>

            {artistProfile.label && (
              <div className="text-sm text-muted-foreground mb-2">
                <span className="text-muted-foreground">Label:</span>{" "}
                {artistProfile.label}
              </div>
            )}

            {artistProfile.updated_at && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>
                  Updated{" "}
                  {formatDate(
                    new Date(artistProfile.updated_at),
                    "MMM d, yyyy, h:mm a",
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistHeroSection;
