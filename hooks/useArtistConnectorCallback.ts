"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { toast } from "sonner";

/**
 * Handle the OAuth callback after an artist connector is authorized.
 *
 * Watches for `artist_connected=true` and `artist_id` in the URL search params
 * (set by the callback_url passed to the authorize endpoint). When detected:
 * 1. Finds the artist by ID from the loaded artists list
 * 2. Opens the settings modal on the "Connectors" tab
 * 3. Cleans up the URL params
 * 4. Shows a success toast
 *
 * Follows the same pattern as ConnectorsPage (searchParams + history.replaceState)
 * and useYouTubeLoginSuccess (query param detection → UI trigger).
 *
 * @returns The default tab to show in Settings ("connectors" if callback detected, otherwise "general")
 */
export function useArtistConnectorCallback(): string {
  const searchParams = useSearchParams();
  const {
    artists,
    toggleUpdate,
    setIsOpenSettingModal,
  } = useArtistProvider();
  const [defaultTab, setDefaultTab] = useState("general");

  useEffect(() => {
    const isCallback = searchParams.get("artist_connected") === "true";
    const artistId = searchParams.get("artist_id");

    if (!isCallback || !artistId) return;

    // Wait until artists are loaded before finding the target
    if (!artists || artists.length === 0) return;

    const artist = artists.find(
      (a: { account_id: string }) => a.account_id === artistId,
    );

    if (!artist) return;

    // Open settings modal to the Connectors tab for this artist
    toggleUpdate(artist);
    setIsOpenSettingModal(true);
    setDefaultTab("connectors");

    // Clean up URL params
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);

    toast.success("Connector connected successfully");
  }, [searchParams, artists, toggleUpdate, setIsOpenSettingModal]);

  return defaultTab;
}
