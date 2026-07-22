"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import SpotifyArtistSearch from "@/components/Artists/SpotifyArtistSearch";
import SocialFixForm from "./SocialFixForm";
import type { SpotifyArtistSearchResult } from "@/types/spotify";

interface SocialSearchOrPasteProps {
  /** Placeholder for the paste-a-link fallback input. */
  pastePlaceholder: string;
  isSubmitting: boolean;
  onSubmit: (url: string) => Promise<boolean>;
}

/**
 * Add/replace a social by searching Spotify (typeahead, reusing #1878's
 * SpotifyArtistSearch) instead of pasting a link — picking an artist submits
 * their Spotify profile URL, which the existing platform-detection path keys
 * as SPOTIFY. A "paste a link instead" fallback stays available for the other
 * platforms (Instagram, TikTok, YouTube, ...) the Spotify search can't reach.
 */
const SocialSearchOrPaste = ({
  pastePlaceholder,
  isSubmitting,
  onSubmit,
}: SocialSearchOrPasteProps) => {
  const [pasting, setPasting] = useState(false);

  const handleSelect = (artist: SpotifyArtistSearchResult) => {
    void onSubmit(artist.external_urls.spotify);
  };

  if (pasting) {
    return (
      <div className="flex flex-col gap-2">
        <SocialFixForm
          placeholder={pastePlaceholder}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start text-muted-foreground"
          onClick={() => setPasting(false)}
        >
          Search Spotify instead
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <SpotifyArtistSearch onSelect={handleSelect} isBusy={isSubmitting} />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start text-muted-foreground"
        onClick={() => setPasting(true)}
      >
        Paste a link instead
      </Button>
    </div>
  );
};

export default SocialSearchOrPaste;
