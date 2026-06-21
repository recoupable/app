import React from "react";
import { Search } from "lucide-react";
import { SpotifySearchResponse } from "@/types/spotify";
import SpotifyContentCard from "./SpotifyContentCard";
import { type SpotifyContent } from "@/lib/spotify/spotifyContentUtils";
import { ToolCard, ToolCardBody } from "./shared/ToolCard";
import ToolEmpty from "./shared/ToolEmpty";

const typeLabels: Record<string, string> = {
  artists: "Artists",
  albums: "Albums",
  tracks: "Tracks",
  playlists: "Playlists",
  shows: "Shows",
  episodes: "Episodes",
  audiobooks: "Audiobooks",
};

const GetSpotifySearchToolResult: React.FC<{
  result: SpotifySearchResponse;
}> = ({ result }) => {
  const sections = Object.entries(result).filter(
    ([key, value]) =>
      key !== "success" &&
      value &&
      typeof value === "object" &&
      "items" in (value as object) &&
      Array.isArray((value as { items?: unknown[] }).items) &&
      ((value as { items?: unknown[] }).items?.length ?? 0) > 0,
  ) as [string, { items: unknown[]; total?: number }][];

  const totalResults = sections.reduce(
    (acc, [, value]) => acc + value.items.length,
    0,
  );

  if (sections.length === 0) {
    return (
      <ToolCard
        icon={Search}
        tone="success"
        title="Spotify search"
        subtitle="No matches"
      >
        <ToolEmpty
          icon={Search}
          title="No results found"
          description="Try a different artist, album, or track name."
        />
      </ToolCard>
    );
  }

  return (
    <ToolCard
      icon={Search}
      tone="success"
      title="Spotify search"
      subtitle={`${totalResults} result${totalResults === 1 ? "" : "s"} across ${sections.length} categor${sections.length === 1 ? "y" : "ies"}`}
    >
      <ToolCardBody className="space-y-5">
        {sections.map(([key, section]) => (
          <div key={key}>
            <div className="mb-2 flex items-center justify-between px-1">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {typeLabels[key] || key}
              </h4>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {section.items.length}
              </span>
            </div>
            <div className="-mx-1 flex snap-x gap-1 overflow-x-auto pb-1">
              {section.items.map((item, idx) => {
                const obj = item as { id?: string };
                return (
                  <div
                    key={obj.id || idx}
                    className="w-[132px] shrink-0 snap-start"
                  >
                    <SpotifyContentCard content={item as SpotifyContent} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </ToolCardBody>
    </ToolCard>
  );
};

export default GetSpotifySearchToolResult;
