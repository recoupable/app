"use client";

import { useEffect, useMemo, useState } from "react";
import { useArtistProvider } from "@/providers/ArtistProvider";

export function useCreateTaskArtistOptions() {
  const { sorted, selectedArtist, isLoading } = useArtistProvider();
  const [artistAccountId, setArtistAccountId] = useState("");

  const artistOptions = useMemo(
    () =>
      sorted
        .filter((artist) => !!artist.account_id)
        .map((artist) => ({
          id: artist.account_id,
          label: artist.name?.trim() || artist.account_id,
        })),
    [sorted],
  );

  useEffect(() => {
    if (!artistAccountId && selectedArtist?.account_id) {
      setArtistAccountId(selectedArtist.account_id);
    }
  }, [artistAccountId, selectedArtist?.account_id]);

  return {
    artistOptions,
    artistAccountId,
    setArtistAccountId,
    isLoadingArtists: isLoading,
  };
}
