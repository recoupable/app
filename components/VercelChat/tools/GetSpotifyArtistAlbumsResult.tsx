import React from "react";
import { SpotifyArtistAlbumsResultUIType } from "@/types/spotify";
import SpotifyContentCard from "./SpotifyContentCard";
import Image from "next/image";
import ToolTextFallback from "./ToolTextFallback";

export interface SpotifyArtistAlbumsErrorResult {
  success: false;
  message: string;
}

export interface GetSpotifyArtistAlbumsResultProps {
  result: SpotifyArtistAlbumsResultUIType | SpotifyArtistAlbumsErrorResult;
}

const GetSpotifyArtistAlbumsResult: React.FC<
  GetSpotifyArtistAlbumsResultProps
> = ({ result }) => {
  if ("success" in result && result.success === false) {
    return (
      <ToolTextFallback
        name="Spotify artist albums"
        error={
          result.message?.trim()
            ? result.message
            : "Could not retrieve Spotify albums."
        }
      />
    );
  }

  const page = result as SpotifyArtistAlbumsResultUIType;
  if (!page.items || page.items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No albums returned from Spotify.
      </p>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Image
          src="/brand-logos/spotify.png"
          alt="Spotify"
          width={24}
          height={24}
          className="rounded-full"
        />
        <div className="font-semibold text-lg">Artist Albums</div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {page.items.map((album) => {
          const releaseYear = album.release_date
            ? new Date(album.release_date).getFullYear()
            : null;
          album = {
            ...album,
            artists: releaseYear
              ? [{ ...album.artists[0], name: releaseYear.toString() }]
              : album.artists,
          };

          return <SpotifyContentCard key={album.id} content={album} />;
        })}
      </div>
      {page.total > page.items.length && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Showing {page.items.length} of {page.total} albums
        </div>
      )}
    </div>
  );
};

export default GetSpotifyArtistAlbumsResult;
