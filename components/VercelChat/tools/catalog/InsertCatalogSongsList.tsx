import { FileMusic } from "lucide-react";
import { CatalogSongsResponse } from "@/lib/catalog/getCatalogSongs";
import { formatArtists } from "@/lib/catalog/formatArtists";
import CatalogSongRow from "./CatalogSongRow";
import ToolEmpty from "../shared/ToolEmpty";

interface InsertCatalogSongsListProps {
  songs: CatalogSongsResponse["songs"];
}

/**
 * Displays catalog songs as a polished list of rows.
 * Each row shows artwork placeholder, title, artist/album and metadata pills.
 */
export default function InsertCatalogSongsList({
  songs,
}: InsertCatalogSongsListProps) {
  if (!songs || songs.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card">
        <ToolEmpty
          icon={FileMusic}
          title="No songs to show"
          description="Songs matching the current filter will appear here."
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <ul className="divide-y divide-border/60 p-1.5">
        {songs.map((song) => (
          <CatalogSongRow
            key={song.isrc || `${song.name}-${formatArtists(song.artists)}`}
            song={song}
          />
        ))}
      </ul>
      <div className="border-t border-border/60 px-3 py-2 text-xs text-muted-foreground">
        Showing {songs.length} song{songs.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
