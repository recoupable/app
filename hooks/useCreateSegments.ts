import { useState } from "react";
import { toast } from "react-toastify";
import { usePrivy } from "@privy-io/react-auth";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { createArtistSegments } from "@/lib/artists/createArtistSegments";

export function useCreateSegments() {
  const { getAccessToken } = usePrivy();
  const { selectedArtist } = useArtistProvider();
  const artist_account_id = selectedArtist?.account_id;
  const [loading, setLoading] = useState(false);

  const createSegments = async (onSuccess?: () => void) => {
    if (!artist_account_id) return;
    setLoading(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to generate segments");
      }
      await createArtistSegments(
        accessToken,
        artist_account_id,
        "Segment my fans to help me fund my next project.",
      );
      toast.success("Segments generated successfully!");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate segments",
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, createSegments };
}
