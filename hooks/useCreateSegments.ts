import { useState } from "react";
import { toast } from "react-toastify";
import { usePrivy } from "@privy-io/react-auth";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

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

      const response = await fetch(
        `${getClientApiBaseUrl()}/api/artists/${artist_account_id}/segments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            prompt: "Segment my fans to help me fund my next project.",
          }),
        },
      );
      const data = await response.json();
      if (!response.ok || data.status !== "success") {
        throw new Error(data.error || "Failed to generate segments");
      }
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
