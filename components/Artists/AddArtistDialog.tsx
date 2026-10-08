"use client";

import { useState } from "react";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useUserProvider } from "@/providers/UserProvder";
import useAccountOrganizations from "@/hooks/useAccountOrganizations";
import { Button } from "@/components/ui/button";
import ManualProfessionalForm from "./ManualProfessionalForm";
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
 * Global roster dialog: add a Spotify artist or explicitly confirm a professional.
 * Opened by `toggleCreation` (Artists page, sidebar, header), replacing the old
 * `/?q=create a new artist` redirect that dead-ended on the onboarding sequence.
 */
const AddArtistDialog = () => {
  const { isCreationOpen, closeCreation } = useArtistProvider();
  const [manual, setManual] = useState(false);
  const { selectedOrgId } = useOrganization();
  const { userData } = useUserProvider();
  const organizations = useAccountOrganizations();
  const org = organizations.data?.find(
    (item) => item.organization_id === selectedOrgId,
  );
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
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {manual ? "Add a songwriter or producer" : "Add to roster"}
          </DialogTitle>
          <DialogDescription>
            {manual
              ? "Confirm a professional record and its organization."
              : "Search Spotify and pick the artist to add them to your roster."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Button
            variant={manual ? "outline" : "default"}
            onClick={() => setManual(false)}
          >
            Spotify artist
          </Button>
          <Button
            variant={manual ? "default" : "outline"}
            onClick={() => setManual(true)}
          >
            Songwriter / producer
          </Button>
        </div>
        {manual ? (
          selectedOrgId && userData?.account_id && org ? (
            <ManualProfessionalForm
              key={`${userData.account_id}:${selectedOrgId}`}
              organizationId={selectedOrgId}
              organizationName={
                org.organization_name || "Selected organization"
              }
              actorId={userData.account_id}
              onSaved={closeCreation}
            />
          ) : (
            <p>
              Select an organization workspace to add a songwriter or producer.
            </p>
          )
        ) : (
          <SpotifyArtistSearch
            onSelect={handleSelect}
            isBusy={isAdding}
            autoFocus
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddArtistDialog;
