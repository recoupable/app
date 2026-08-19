"use client";

import { useState } from "react";
import SongRow from "./SongRow";
import { formatMonthYear } from "@/lib/dates/formatMonthYear";
import { VALUATION_URL } from "@/lib/consts";
import EmptySongsState from "./EmptySongsState";
import type { ArtistProfileCatalog, ArtistProfileSocial } from "@/lib/recoup/getArtistProfile";

const PREVIEW_COUNT = 5;

/**
 * The SONGS section per the approved V2 canvas: one block per catalog,
 * column-labeled Spotify-style rows, top 5 with a "Show all N songs"
 * expander, and the valuation CTA card below.
 */
const SongsSection = ({
  catalogs,
  artistId,
  socials,
}: {
  catalogs: ArtistProfileCatalog[];
  artistId: string;
  socials: ArtistProfileSocial[];
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const withSongs = catalogs.filter(c => c.songs.length > 0);
  // Inverted from `return null` (chat#1973): the no-songs state is where the
  // run button matters most, not a reason to hide the section.
  if (withSongs.length === 0) return <EmptySongsState artistId={artistId} socials={socials} />;

  return (
    <section className="flex flex-col gap-6 px-5 pb-12 md:px-12 md:pb-16">
      {withSongs.map(catalog => {
        const isOpen = !!expanded[catalog.id];
        const rows = isOpen ? catalog.songs : catalog.songs.slice(0, PREVIEW_COUNT);
        const updated = formatMonthYear(catalog.updated_at);
        return (
          <div key={catalog.id} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex flex-wrap items-baseline gap-3">
                <h2 className="font-mono text-lg font-bold uppercase tracking-wide md:text-[22px]">
                  Songs
                </h2>
                <span className="text-xs text-muted-foreground md:text-sm">
                  {catalog.name} · {catalog.song_count}{" "}
                  {catalog.song_count === 1 ? "song" : "songs"}
                  {updated && ` · Updated ${updated}`}
                </span>
              </div>
              <span className="text-xs text-muted-foreground md:text-[13px]">
                Plays from Spotify
              </span>
            </div>
            <div className="hidden grid-cols-[32px_44px_minmax(0,1fr)_220px_110px_110px] gap-3.5 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground md:grid">
              <div>#</div>
              <div />
              <div>Title</div>
              <div>Album</div>
              <div className="text-right">Plays</div>
              <div className="text-right">Est. value</div>
            </div>
            <div className="hidden h-px bg-border md:block" />
            <div className="flex flex-col">
              {rows.map((song, i) => (
                <SongRow key={song.isrc} song={song} index={i} />
              ))}
              {catalog.songs.length > PREVIEW_COUNT && (
                <button
                  type="button"
                  onClick={() => setExpanded(prev => ({ ...prev, [catalog.id]: !isOpen }))}
                  className="flex items-center gap-2 px-2.5 py-3.5 text-left text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground md:px-4 md:text-sm"
                >
                  <span>{isOpen ? "Show fewer songs" : `Show all ${catalog.songs.length} songs`}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={isOpen ? "rotate-180" : ""}
                    aria-hidden
                  >
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        );
      })}
      <a
        href={VALUATION_URL}
        className="flex items-center justify-center self-start rounded-xl bg-muted px-5 py-3.5 text-sm text-muted-foreground shadow-[0px_0px_0px_1px_var(--border)] transition-colors hover:text-foreground"
      >
        Get a free valuation for this catalog →
      </a>
    </section>
  );
};

export default SongsSection;
