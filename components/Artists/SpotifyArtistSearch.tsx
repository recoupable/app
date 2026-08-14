"use client";

import { useState } from "react";
import { Loader, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSpotifyArtistSearch } from "@/hooks/useSpotifyArtistSearch";
import formatFollowerCount from "@/lib/utils/formatFollowerCount";
import type { SpotifyArtistSearchResult } from "@/types/spotify";

interface SpotifyArtistSearchProps {
  onSelect: (artist: SpotifyArtistSearchResult) => void;
  /** Disables input + results while an add is in flight. */
  isBusy?: boolean;
  autoFocus?: boolean;
}

/**
 * Shared Spotify artist typeahead: type -> see matches (avatar · name ·
 * followers) -> pick. Reused by the "Add New Artist" dialog and (next slice)
 * social enrichment, so it only searches and reports the choice — the caller
 * owns what happens on select.
 */
const SpotifyArtistSearch = ({
  onSelect,
  isBusy,
  autoFocus,
}: SpotifyArtistSearchProps) => {
  const [query, setQuery] = useState("");
  const { results, isSearching } = useSpotifyArtistSearch(query);
  const hasQuery = query.trim().length >= 2;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Spotify for an artist"
          className="pl-9"
          aria-label="Search Spotify for an artist"
          disabled={isBusy}
        />
      </div>

      <div
        className="flex max-h-72 flex-col gap-1 overflow-y-auto"
        role="listbox"
        aria-label="Spotify artist results"
      >
        {isSearching && results.length === 0 && (
          <p className="flex items-center gap-2 px-1 py-2 text-sm text-muted-foreground">
            <Loader className="size-4 animate-spin" /> Searching...
          </p>
        )}
        {!isSearching && hasQuery && results.length === 0 && (
          <p className="px-1 py-2 text-sm text-muted-foreground">
            No artists found.
          </p>
        )}
        {results.map((artist) => (
          <button
            key={artist.id}
            type="button"
            role="option"
            aria-selected={false}
            disabled={isBusy}
            onClick={() => onSelect(artist)}
            className="flex items-center gap-3 rounded-lg p-2 text-left hover:bg-muted disabled:opacity-50"
          >
            {artist.images?.[0]?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artist.images[0].url}
                alt=""
                className="size-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="size-10 shrink-0 rounded-full bg-muted" />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {artist.name}
              </p>
              {typeof artist.followers?.total === "number" && (
                <p className="text-xs text-muted-foreground">
                  {formatFollowerCount(artist.followers.total)} followers
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpotifyArtistSearch;
