"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Music2, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { OnboardingNavButtons } from "./OnboardingNavButtons";
import { getRoleConfig } from "./onboardingRoleConfig";
import { useSpotifyArtistSearch, type SpotifyArtist } from "./useSpotifyArtistSearch";
import { useState } from "react";

export interface ArtistEntry {
  name: string;
  spotifyUrl?: string;
  imageUrl?: string;
}

interface Props {
  artists: ArtistEntry[];
  onUpdate: (artists: ArtistEntry[]) => void;
  onNext: () => void;
  onBack: () => void;
  roleType?: string;
}

/**
 * Artist step — live Spotify search with avatars, manual fallback.
 */
export function OnboardingArtistsStep({ artists, onUpdate, onNext, onBack, roleType }: Props) {
  const { query, setQuery, results, searching, clearResults } = useSpotifyArtistSearch();
  const [focused, setFocused] = useState(false);

  const { artistPlaceholder } = getRoleConfig(roleType);

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
    clearResults();
  };

  const addManual = () => {
    const trimmed = query.trim();
    if (!trimmed || artists.some(x => x.name.toLowerCase() === trimmed.toLowerCase())) return;
    onUpdate([...artists, { name: trimmed }]);
    clearResults();
  };

  const remove = (idx: number) => onUpdate(artists.filter((_, i) => i !== idx));

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
            placeholder={artistPlaceholder}
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

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border bg-popover shadow-lg overflow-hidden">
            {results.map(a => (
              <ArtistSearchResult key={a.id} artist={a} onSelect={addFromSpotify} />
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
              <ArtistAvatar />
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
            <li key={i} className="flex items-center gap-3 rounded-xl border bg-muted/20 px-3 py-2.5">
              <ArtistAvatar imageUrl={a.imageUrl} name={a.name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{a.name}</p>
                {a.spotifyUrl && (
                  <p className="text-xs text-muted-foreground">Spotify connected ✓</p>
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

      <div className="flex flex-col gap-2">
        <OnboardingNavButtons
          onBack={onBack}
          onNext={onNext}
          nextDisabled={artists.length === 0}
          nextLabel={
            artists.length > 0
              ? `Research ${artists.length} artist${artists.length > 1 ? "s" : ""} →`
              : "Add at least one artist"
          }
        />
        {artists.length === 0 && (
          <button
            type="button"
            onClick={onNext}
            className="text-xs text-center text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now — you can add artists later
          </button>
        )}
      </div>
    </div>
  );
}

/** Small helper components scoped to this file */

function ArtistAvatar({ imageUrl, name }: { imageUrl?: string; name?: string }) {
  return imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl} alt={name ?? ""} className="h-9 w-9 rounded-full object-cover shrink-0" />
  ) : (
    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
      <Music2 className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

function ArtistSearchResult({
  artist,
  onSelect,
}: {
  artist: SpotifyArtist;
  onSelect: (a: SpotifyArtist) => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={() => onSelect(artist)}
      className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-muted transition-colors text-left"
    >
      <ArtistAvatar imageUrl={artist.images?.[0]?.url} name={artist.name} />
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{artist.name}</p>
        <p className="text-xs text-muted-foreground">
          {artist.followers?.total?.toLocaleString()} followers
        </p>
      </div>
    </button>
  );
}
