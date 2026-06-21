import React, { useEffect } from "react";
import { CreateArtistResult } from "@/types/createArtistResult";
import useCreateArtistTool from "@/hooks/useCreateArtistTool";
import GenericSuccess from "./GenericSuccess";
import { ToolError } from "./shared/ToolError";
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
  const { isProcessing, error: processingError } = useCreateArtistTool(result);

  useEffect(() => {
    getArtists(result.artistAccountId);
  }, [result.artistAccountId, getArtists]);

  // If there's an error or no artist data, show error state
  if (!result.artist) {
    return (
      <ToolError
        title="Create artist"
        message={result.error || "We couldn't create this artist. Please try again."}
      />
    );
  }

  return (
    <GenericSuccess
      image={result.artist.image}
      name={result.artist.name}
      message={
        isProcessing
          ? "Setting up artist conversation..."
          : processingError
            ? `Created successfully but: ${processingError}`
            : "Artist created successfully"
      }
    />
  );
}

export default CreateArtistToolResult;
