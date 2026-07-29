"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import SpotifyArtistSearch from "@/components/Artists/SpotifyArtistSearch";
import { useAddSpotifyArtist } from "@/hooks/useAddSpotifyArtist";
import type { SpotifyArtistSearchResult } from "@/types/spotify";

/**
 * "Add an artist" for the onboarding roster step, by Spotify typeahead.
 *
 * It used to take a free-text name, which produced an artist with no Spotify id
 * — so no catalog and therefore no valuation could follow, and the payoff was
 * structurally unreachable for anyone who arrived without a funnel valuation
 * (chat#1889). Picking a real Spotify artist resolves the id, profile URL, and
 * avatar in one step, reusing the same typeahead as verify-socials (chat#1882).
 *
 * Adds through `useAddSpotifyArtist` — the same hook the `/artists` dialog uses
 * — because it also kicks `POST /api/valuation` for the picked artist when the
 * account has no catalog yet. Without that seeding an account onboarded here
 * finished setup with nothing to value, so the reward on the completion panel
 * could only ever render its "Claim your catalog" fallback (chat#1889 row 8).
 */
const AddArtistForm = () => {
  const { add, isAdding } = useAddSpotifyArtist();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = async (artist: SpotifyArtistSearchResult) => {
    const added = await add(artist);
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
