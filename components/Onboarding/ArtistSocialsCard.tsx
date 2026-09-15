"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ArtistRecord } from "@/types/Artist";
import SocialRow from "./SocialRow";
import SocialSearchOrPaste from "./SocialSearchOrPaste";

interface ArtistSocialsCardProps {
  artist: ArtistRecord;
  isFixing: boolean;
  onFix: (url: string) => Promise<boolean>;
  onRemove: (socialId: string) => Promise<boolean>;
}

/**
 * Missing profiles open directly into search so the required action is visible.
 */
const ArtistSocialsCard = ({
  artist,
  isFixing,
  onFix,
  onRemove,
}: ArtistSocialsCardProps) => {
  const socials = artist.account_socials ?? [];
  const [adding, setAdding] = useState(socials.length === 0);

  const handleAdd = async (url: string) => {
    const saved = await onFix(url);
    if (saved) setAdding(false);
    return saved;
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-card flex flex-col gap-2">
      <h2 className="font-medium text-card-foreground truncate">
        {artist.name || "Untitled artist"}
      </h2>

      {socials.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No profile linked yet. Search for this artist on Spotify, or paste
          their Instagram, TikTok, YouTube, or other supported profile link.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {socials.map((social) => (
            <SocialRow
              key={social.id}
              social={social}
              isSubmitting={isFixing}
              onFix={onFix}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}

      {/* Always available: a matched-social list can still be missing platforms. */}
      {adding ? (
        <SocialSearchOrPaste
          pastePlaceholder="Paste a profile link"
          isSubmitting={isFixing}
          onSubmit={handleAdd}
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => setAdding(true)}
        >
          Add a profile
        </Button>
      )}
    </div>
  );
};

export default ArtistSocialsCard;
