import React, { useEffect } from "react";
import { CreateArtistResult } from "@/types/createArtistResult";
import GenericSuccess from "./GenericSuccess";
import { useArtistProvider } from "@/providers/ArtistProvider";

/**
 * Props for the CreateArtistToolResult component
 */
interface CreateArtistToolResultProps {
  result: CreateArtistResult;
}

/**
 * Component that displays the result of the create_new_artist tool
 * Also handles refreshing the artist list and selecting the new artist
 */
export function CreateArtistToolResult({
  result,
}: CreateArtistToolResultProps) {
  const { getArtists } = useArtistProvider();

  useEffect(() => {
    getArtists(result.artistAccountId);
  }, [result.artistAccountId, getArtists]);

  // If there's an error or no artist data, show error state
  if (!result.artist) {
    return (
      <div className="flex items-center space-x-4 p-3 rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 my-2">
        <div className="h-12 w-12 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center">
          <span className="text-lg font-medium text-red-600 dark:text-red-400">!</span>
        </div>
        <div>
          <p className="font-medium dark:text-white">Artist Creation Failed</p>
          <p className="text-sm text-red-600 dark:text-red-400">
            {result.error || "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <GenericSuccess
      image={result.artist.image}
      name={result.artist.name}
      message="Artist created successfully"
    />
  );
}

export default CreateArtistToolResult;
