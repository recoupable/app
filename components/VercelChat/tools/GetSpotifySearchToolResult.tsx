import type { SpotifySearchResponse } from "@/types/spotify";
import SpotifyContentCard from "./SpotifyContentCard";
import { type SpotifyContent } from "@/lib/spotify/spotifyContentUtils";

const typeLabels: Record<string, string> = {
  artists: "Artists",
  albums: "Albums",
  tracks: "Tracks",
  playlists: "Playlists",
  shows: "Shows",
  episodes: "Episodes",
  audiobooks: "Audiobooks",
};

interface GetSpotifySearchToolResultProps {
  result: SpotifySearchResponse;
}

export default function GetSpotifySearchToolResult({
  result,
}: GetSpotifySearchToolResultProps) {
  const sections = Object.entries(result).filter(
    ([key, value]) =>
      key !== "success" &&
      value &&
      typeof value === "object" &&
      "items" in (value as object) &&
      Array.isArray((value as { items?: unknown[] }).items) &&
      ((value as { items?: unknown[] }).items?.length ?? 0) > 0,
  );

  if (sections.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No Spotify search results returned.
      </p>
    );
  }

  return (
    <div>
      {sections.map(([key, value]) => {
        const section = value as { items: unknown[] };
        return (
          <div key={key} className="mb-6">
            <div className="font-semibold text-lg mb-2">
              {typeLabels[key] || key}
            </div>
            <div className="flex flex-nowrap overflow-x-auto pb-1 -mx-2">
              {section.items.map((item) => {
                const obj = item as { id?: string; name?: string };
                return (
                  <div
                    key={obj.id || Math.random()}
                    className="w-[140px] m-2 flex-shrink-0"
                  >
                    <SpotifyContentCard content={item as SpotifyContent} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
