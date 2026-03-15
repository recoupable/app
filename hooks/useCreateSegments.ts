import { useState } from "react";
import { toast } from "react-toastify";
import { useArtistProvider } from "@/providers/ArtistProvider";

/**
 *
 */
export function useCreateSegments() {
  const { selectedArtist } = useArtistProvider();
  const artist_account_id = selectedArtist?.account_id;
  const [loading, setLoading] = useState(false);

  const createSegments = async (onSuccess?: () => void) => {
    if (!artist_account_id) return;
    setLoading(true);
    try {
      const response = await fetch("/api/segments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artist_account_id,
          prompt: "Segment my fans to help me fund my next project.",
        }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to generate segments");
      }
      toast.success("Segments generated successfully!");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate segments");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, createSegments };
}
