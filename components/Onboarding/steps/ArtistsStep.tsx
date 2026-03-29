"use client";

import { useState, useEffect, useCallback } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useUserProvider } from "@/providers/UserProvder";
import useAccountOrganizations from "@/hooks/useAccountOrganizations";
import { useOrganization } from "@/providers/OrganizationProvider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArtistRecord } from "@/types/Artist";
import { NEW_API_BASE_URL } from "@/lib/consts";

interface ArtistsStepProps {
  onNext: () => void;
  onBack: () => void;
}

const MAX_ARTISTS = 3;

export default function ArtistsStep({ onNext, onBack }: ArtistsStepProps) {
  const { setPriorityArtists, priorityArtists: savedPriorityArtists } =
    useOnboarding();
  const { userData } = useUserProvider();
  const { data: organizations } = useAccountOrganizations();
  const { selectedOrgId } = useOrganization();

  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [artists, setArtists] = useState<ArtistRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get the org name from selected org or first org
  const selectedOrg = organizations?.find(
    (org) => org.organization_id === selectedOrgId
  );
  const orgName =
    selectedOrg?.organization_name ||
    organizations?.[0]?.organization_name ||
    "your organization";
  const orgId = selectedOrgId || organizations?.[0]?.organization_id;

  // Fetch org artists
  const fetchArtists = useCallback(async () => {
    if (!userData?.id || !orgId) {
      setArtists([]);
      setIsLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        accountId: userData.id as string,
        orgId: orgId,
      });

      const response = await fetch(
        `${NEW_API_BASE_URL}/api/artists?${params.toString()}`
      );
      const data = await response.json();
      const newArtists: ArtistRecord[] = data.artists || [];
      setArtists(newArtists);
    } catch {
      setArtists([]);
    } finally {
      setIsLoading(false);
    }
  }, [userData?.id, orgId]);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  // Pre-fill from saved state on mount
  useEffect(() => {
    if (savedPriorityArtists && savedPriorityArtists.length > 0) {
      setSelectedArtists(savedPriorityArtists);
    }
  }, [savedPriorityArtists]);

  const handleToggleArtist = (artistId: string) => {
    setSelectedArtists((prev) => {
      if (prev.includes(artistId)) {
        // Remove artist
        return prev.filter((id) => id !== artistId);
      } else if (prev.length < MAX_ARTISTS) {
        // Add artist (max 3)
        return [...prev, artistId];
      }
      return prev;
    });
  };

  const handleContinue = () => {
    if (selectedArtists.length > 0) {
      setPriorityArtists(selectedArtists);
      onNext();
    }
  };

  const isDisabled = selectedArtists.length === 0;

  // Get initials for avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-muted rounded mb-4" />
          <div className="h-6 w-48 bg-muted rounded mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">No Artists Found</h1>
        <p className="text-lg text-muted-foreground mb-8">
          {orgName} doesn&apos;t have any artists yet.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack} className="px-8">
            Back
          </Button>
          <Button
            onClick={onNext}
            className="px-8"
            style={{ backgroundColor: "#345A5D" }}
          >
            Skip
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-2xl font-semibold mb-2">
        Here&apos;s {orgName}&apos;s roster.
      </h1>
      <p className="text-lg text-muted-foreground mb-2">
        Who are your priority artists right now?
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        (Pick 1-{MAX_ARTISTS} you&apos;re most focused on)
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl mb-8">
        {artists.map((artist) => {
          const isSelected = selectedArtists.includes(artist.account_id);
          const isAtMax =
            selectedArtists.length >= MAX_ARTISTS && !isSelected;

          return (
            <button
              key={artist.account_id}
              type="button"
              onClick={() => handleToggleArtist(artist.account_id)}
              disabled={isAtMax}
              className={`
                p-4 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-3
                ${
                  isSelected
                    ? "border-[#345A5D] bg-[#345A5D]/10"
                    : isAtMax
                      ? "border-input opacity-50 cursor-not-allowed"
                      : "border-input hover:border-[#345A5D]/50"
                }
              `}
              style={{
                borderColor: isSelected ? "#345A5D" : undefined,
              }}
            >
              <Avatar className="h-16 w-16">
                {artist.image && (
                  <AvatarImage src={artist.image} alt={artist.name || "Artist"} />
                )}
                <AvatarFallback className="text-lg">
                  {getInitials(artist.name)}
                </AvatarFallback>
              </Avatar>
              <div className="font-medium truncate w-full">
                {artist.name || "Unknown Artist"}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="px-8">
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={isDisabled}
          className="px-8"
          style={{
            backgroundColor: isDisabled ? undefined : "#345A5D",
          }}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
