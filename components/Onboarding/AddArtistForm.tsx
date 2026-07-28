"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import SpotifyArtistSearch from "@/components/Artists/SpotifyArtistSearch";
import { useAddRosterArtist } from "@/hooks/onboarding/useAddRosterArtist";
import type { SpotifyArtistSearchResult } from "@/types/spotify";

/**
 * "Add an artist" for the onboarding roster step, by Spotify typeahead.
 *
 * It used to take a free-text name, which produced an artist with no Spotify id
 * — so no catalog and therefore no valuation could follow, and the payoff was
 * structurally unreachable for anyone who arrived without a funnel valuation
 * (chat#1889). Picking a real Spotify artist resolves the id, profile URL, and
 * avatar in one step, reusing the same typeahead as verify-socials (chat#1882).
 */
const AddArtistForm = () => {
  const { addArtist, isAdding } = useAddRosterArtist();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = async (artist: SpotifyArtistSearchResult) => {
    const added = await addArtist(artist.name, {
      profileUrl: artist.external_urls.spotify,
      image: artist.images?.[0]?.url,
    });
    if (added) setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="size-4 mr-2" />
        Add another artist
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <SpotifyArtistSearch
        autoFocus
        isBusy={isAdding}
        onSelect={(artist) => void handleSelect(artist)}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start text-muted-foreground"
        disabled={isAdding}
        onClick={() => setIsOpen(false)}
      >
        Cancel
      </Button>
    </div>
  );
};

export default AddArtistForm;
