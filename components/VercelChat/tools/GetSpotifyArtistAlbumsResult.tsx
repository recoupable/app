import React from "react";
import { Disc3 } from "lucide-react";
import { SpotifyArtistAlbumsResultUIType } from "@/types/spotify";
import SpotifyContentCard from "./SpotifyContentCard";
import { ToolCard, ToolCardBody } from "./shared/ToolCard";
import ToolEmpty from "./shared/ToolEmpty";

const GetSpotifyArtistAlbumsResult: React.FC<{
  result: SpotifyArtistAlbumsResultUIType;
}> = ({ result }) => {
  if (!result.items || result.items.length === 0) {
    return (
      <ToolCard
        icon={Disc3}
        tone="success"
        title="Artist albums"
        subtitle="No releases"
      >
        <ToolEmpty
          icon={Disc3}
          title="No albums found"
          description="This artist has no albums available on Spotify."
        />
      </ToolCard>
    );
  }

  const showingMore = result.total > result.items.length;

  return (
    <ToolCard
      icon={Disc3}
      tone="success"
      title="Artist albums"
      subtitle={
        showingMore
          ? `Showing ${result.items.length} of ${result.total}`
          : `${result.items.length} release${result.items.length === 1 ? "" : "s"}`
      }
    >
      <ToolCardBody>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4">
          {result.items.map((album) => {
            const releaseYear = album.release_date
              ? new Date(album.release_date).getFullYear()
              : null;
            // Surface the release year as the card subtitle (in place of artist).
            const displayAlbum = {
              ...album,
              artists:
                releaseYear && album.artists.length > 0
                  ? [{ ...album.artists[0], name: releaseYear.toString() }]
                  : album.artists,
            };

            return (
              <SpotifyContentCard key={album.id} content={displayAlbum} />
            );
          })}
        </div>
      </ToolCardBody>
    </ToolCard>
  );
};

export default GetSpotifyArtistAlbumsResult;
