"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import SpotifyArtistSearch from "@/components/Artists/SpotifyArtistSearch";
import SocialFixForm from "./SocialFixForm";
import SocialPlatformPicker from "./SocialPlatformPicker";
import type { SocialPlatformOption } from "@/lib/onboarding/getSocialPlatformOptions";
import type { SpotifyArtistSearchResult } from "@/types/spotify";

interface SocialSearchOrPasteProps {
  /** Placeholder for the paste-a-link fallback input. */
  pastePlaceholder: string;
  isSubmitting: boolean;
  onSubmit: (url: string) => Promise<boolean>;
  /**
   * Ask which platform first. Used on the ADD path, where the missing platform
   * is unknown; the edit path already knows which social it is replacing.
   */
  withPlatformPicker?: boolean;
}

/**
 * Add/replace a social. Picking a Spotify artist submits their profile URL,
 * which the existing platform-detection path keys as SPOTIFY; a paste-a-link
 * fallback covers the platforms Spotify search can't reach.
 *
 * On the add path this leads with a platform picker (chat#1889): it used to jump
 * straight to a Spotify search, so an artist whose Instagram was unmatched had
 * no obvious way to supply it.
 */
const SocialSearchOrPaste = ({
  pastePlaceholder,
  isSubmitting,
  onSubmit,
  withPlatformPicker = false,
}: SocialSearchOrPasteProps) => {
  const [platform, setPlatform] = useState<SocialPlatformOption | null>(null);
  const [pasting, setPasting] = useState(false);

  const handleSelect = (artist: SpotifyArtistSearchResult) => {
    void onSubmit(artist.external_urls.spotify);
  };

  if (withPlatformPicker && !platform) {
    return (
      <SocialPlatformPicker disabled={isSubmitting} onSelect={setPlatform} />
    );
  }

  const canSearch = platform ? platform.supportsSearch : true;
  const placeholder = platform?.placeholder ?? pastePlaceholder;

  if (!canSearch || pasting) {
    return (
      <div className="flex flex-col gap-2">
        <SocialFixForm
          placeholder={placeholder}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
        {/* Only Spotify has a typeahead worth going back to. */}
        {canSearch && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="self-start text-muted-foreground"
            onClick={() => setPasting(false)}
          >
            Search Spotify instead
          </Button>
        )}
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
