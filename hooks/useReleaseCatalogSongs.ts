"use client";
import { useEffect, useRef, useState } from "react";
import { getReleaseCatalogSongs } from "@/lib/releases/getReleaseCatalogSongs";
import type { StreamCatalogSong } from "@/lib/releases/catalogStreamTypes";
/** Cancel and hide the previous catalog before rendering any new workspace selection. */
export function useReleaseCatalogSongs(
  catalogId: string,
  getAccessToken: () => Promise<string | null>,
) {
  const token = useRef(getAccessToken);
  useEffect(() => {
    token.current = getAccessToken;
  }, [getAccessToken]);
  const [revision, setRevision] = useState(0);
  const key = JSON.stringify([catalogId, revision]);
  const [read, setRead] = useState<{
    key: string;
    songs: StreamCatalogSong[];
    error: string;
    loading: boolean;
  }>({ key: "", songs: [], error: "", loading: false });
  useEffect(() => {
    if (!catalogId) return;
    const controller = new AbortController();
    void getReleaseCatalogSongs(
      catalogId,
      () => token.current(),
      controller.signal,
    )
      .then((songs) => {
        if (!controller.signal.aborted)
          setRead({ key, songs, error: "", loading: false });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setRead({
            key,
            songs: [],
            error:
              error instanceof Error && error.name !== "ZodError"
                ? error.message
                : "Could not load release metadata. Please retry.",
            loading: false,
          });
      });
    return () => controller.abort();
  }, [catalogId, key]);
  const visible =
    read.key === key ? read : { songs: [], error: "", loading: !!catalogId };
  return {
    songs: visible.songs,
    error: visible.error,
    loading: visible.loading,
    refresh: () => setRevision((value) => value + 1),
  };
}
