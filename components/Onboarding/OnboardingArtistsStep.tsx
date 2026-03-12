"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Music2, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NEW_API_BASE_URL } from "@/lib/consts";
import { useAccessToken } from "@/hooks/useAccessToken";

interface ArtistEntry {
  name: string;
  spotifyUrl?: string;
  imageUrl?: string;
}

interface SpotifyArtist {
  id: string;
  name: string;
  external_urls: { spotify: string };
  images: { url: string }[];
  followers: { total: number };
}

interface Props {
  artists: ArtistEntry[];
  onUpdate: (artists: ArtistEntry[]) => void;
  onNext: () => void;
  onBack: () => void;
  roleType?: string;
}

const ROLE_PLACEHOLDER: Record<string, string> = {
  artist_manager: "Search for an artist you manage…",
  label: "Search for a roster artist…",
  artist: "Search for yourself or a collaborator…",
  publisher: "Search for a catalog artist…",
  other: "Search for an artist…",
};

/**
 * Artist step with live Spotify search, avatar display, and manual fallback.
 */
export function OnboardingArtistsStep({ artists, onUpdate, onNext, onBack, roleType }: Props) {
  const accessToken = useAccessToken();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifyArtist[]>([]);
  const [searching, setSearching] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setResults([]); return; }
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
  }, [accessToken]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 320);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  const addFromSpotify = (a: SpotifyArtist) => {
    if (artists.some(x => x.spotifyUrl === a.external_urls.spotify)) return;
    onUpdate([
      ...artists,
      {
        name: a.name,
        spotifyUrl: a.external_urls.spotify,
        imageUrl: a.images?.[0]?.url,
      },
    ]);
    setQuery("");
    setResults([]);
  };

  const addManual = () => {
    const trimmed = query.trim();
    if (!trimmed || artists.some(x => x.name.toLowerCase() === trimmed.toLowerCase())) return;
    onUpdate([...artists, { name: trimmed }]);
    setQuery("");
    setResults([]);
  };

  const remove = (idx: number) => onUpdate(artists.filter((_, i) => i !== idx));

  const placeholder = ROLE_PLACEHOLDER[roleType ?? ""] ?? "Search for an artist…";
  const showDropdown = focused && (results.length > 0 || (searching && query.length > 1));
  const showManualAdd = focused && query.trim().length > 1 && !searching && results.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add your priority artists</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ll run deep research — fan data, release windows, competitive benchmarks
          — before you ever open a chat.
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onKeyDown={e => {
              if (e.key === "Enter" && results.length > 0) addFromSpotify(results[0]);
              else if (e.key === "Enter" && query.trim()) addManual();
            }}
            className="pl-9 pr-9"
          />
          {searching && (
            <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Dropdown results */}
        {showDropdown && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border bg-popover shadow-lg overflow-hidden">
            {results.map(a => (
              <button
                key={a.id}
                type="button"
                onMouseDown={() => addFromSpotify(a)}
                className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-muted transition-colors text-left"
              >
                {a.images?.[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.images[0].url}
                    alt={a.name}
                    className="h-9 w-9 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Music2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{a.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.followers?.total?.toLocaleString()} followers
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Manual add fallback */}
        {showManualAdd && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border bg-popover shadow-lg overflow-hidden">
            <button
              type="button"
              onMouseDown={addManual}
              className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-muted transition-colors text-left"
            >
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Music2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Add &ldquo;{query.trim()}&rdquo;</p>
                <p className="text-xs text-muted-foreground">Add manually</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Added artists */}
      {artists.length > 0 && (
        <ul className="flex flex-col gap-2">
          {artists.map((a, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-xl border bg-muted/20 px-3 py-2.5"
            >
              {a.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.imageUrl}
                  alt={a.name}
                  className="h-9 w-9 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Music2 className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{a.name}</p>
                {a.spotifyUrl && (
                  <p className="text-xs text-muted-foreground truncate">Spotify connected ✓</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded-md p-1 hover:bg-muted/60 transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="w-24">
          ← Back
        </Button>
        <Button
          onClick={onNext}
          disabled={artists.length === 0}
          className={cn("flex-1", artists.length === 0 && "opacity-50")}
        >
          {artists.length > 0
            ? `Research ${artists.length} artist${artists.length > 1 ? "s" : ""} →`
            : "Add at least one artist"}
        </Button>
      </div>

      {artists.length === 0 && (
        <button
          type="button"
          onClick={onNext}
          className="text-xs text-center text-muted-foreground hover:text-foreground transition-colors -mt-3"
        >
          Skip for now — you can add artists later
        </button>
      )}
    </div>
  );
}
