"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NEW_API_BASE_URL } from "@/lib/consts";
import { useAccessToken } from "@/hooks/useAccessToken";

export interface SpotifyArtist {
  id: string;
  name: string;
  external_urls: { spotify: string };
  images: { url: string }[];
  followers: { total: number };
}

/**
 * Debounced Spotify artist search hook.
 * Encapsulates all search state, debouncing, and API fetching logic.
 */
export function useSpotifyArtistSearch() {
  const accessToken = useAccessToken();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifyArtist[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    async (q: string) => {
      if (!q.trim() || q.length < 2) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        const params = new URLSearchParams({ q, type: "artist", limit: "5" });
        const url = `${NEW_API_BASE_URL}/api/spotify/search?${params}`;
        const headers: HeadersInit = accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {};
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error("search failed");
        const data = await res.json();
        setResults(data?.artists?.items ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 320);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const clearResults = useCallback(() => {
    setResults([]);
    setQuery("");
  }, []);

  return { query, setQuery, results, searching, clearResults };
}
