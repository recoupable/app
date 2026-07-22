"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useAddSpotifyArtist } from "@/hooks/useAddSpotifyArtist";
import SpotifyArtistSearch from "./SpotifyArtistSearch";
import type { SpotifyArtistSearchResult } from "@/types/spotify";

/**
 * Global "Add New Artist" dialog: search Spotify -> pick -> add to the roster.
 * Opened by `toggleCreation` (Artists page, sidebar, header), replacing the old
 * `/?q=create a new artist` redirect that dead-ended on the onboarding sequence.
 */
const AddArtistDialog = () => {
  const { isCreationOpen, closeCreation } = useArtistProvider();
  const { add, isAdding } = useAddSpotifyArtist();

  const handleSelect = async (artist: SpotifyArtistSearchResult) => {
    const added = await add(artist);
    if (added) closeCreation();
  };

  return (
    <Dialog
      open={Boolean(isCreationOpen)}
      onOpenChange={(open) => {
        if (!open) closeCreation();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new artist</DialogTitle>
          <DialogDescription>
            Search Spotify and pick the artist to add them to your roster.
          </DialogDescription>
        </DialogHeader>
        <SpotifyArtistSearch
          onSelect={handleSelect}
          isBusy={isAdding}
          autoFocus
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddArtistDialog;
