"use client";

import { useEffect, useState } from "react";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type {
  SpotifyArtistSearchResult,
  SpotifySearchResponse,
} from "@/types/spotify";

interface UseSpotifyArtistSearchResult {
  results: SpotifyArtistSearchResult[];
  isSearching: boolean;
}

/**
 * Debounced Spotify artist typeahead against the existing public
 * `GET /api/spotify/search?type=artist` endpoint. Aborts the in-flight
 * request when the query changes so results never arrive out of order.
 */
export function useSpotifyArtistSearch(
  query: string,
): UseSpotifyArtistSearchResult {
  const [results, setResults] = useState<SpotifyArtistSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${getClientApiBaseUrl()}/api/spotify/search?q=${encodeURIComponent(
            trimmed,
          )}&type=artist`,
          { signal: controller.signal },
        );
        const data: SpotifySearchResponse = await res.json();
        setResults(data.artists?.items ?? []);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  return { results, isSearching };
}
