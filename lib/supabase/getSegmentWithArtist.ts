import { PostgrestError } from "@supabase/supabase-js";
import supabase from "./serverClient";
import { Database } from "@/types/database.types";

type Segment = Database["public"]["Tables"]["segments"]["Row"] & {
  artist_segments?: Database["public"]["Tables"]["artist_segments"]["Row"][];
};

interface GetSegmentResult {
  segment: Segment | null;
  artistAccountId: string | null;
  error: PostgrestError | null;
}

const createNotFoundError = (segmentId: string): PostgrestError => ({
  message: "Segment not found",
  details: `No segment found with id: ${segmentId}`,
  hint: "",
  code: "NOT_FOUND",
  name: "PostgrestError",
});

export const getSegmentWithArtist = async (segmentId: string): Promise<GetSegmentResult> => {
  try {
    const { data: segmentData, error: segmentError } = await supabase
      .from("segments")
      .select(
        `
        *,
        artist_segments (
          artist_account_id
        )
      `,
      )
      .eq("id", segmentId)
      .single();

    if (segmentError) {
      console.error("Error fetching segment:", segmentError);
      return { segment: null, artistAccountId: null, error: segmentError };
    }

    if (!segmentData) {
      console.error("Segment not found:", segmentId);
      return {
        segment: null,
        artistAccountId: null,
        error: createNotFoundError(segmentId),
      };
    }

    const artistAccountId = segmentData.artist_segments?.[0]?.artist_account_id || null;

    return {
      segment: segmentData,
      artistAccountId,
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error in getSegmentWithArtist:", error);
    return {
      segment: null,
      artistAccountId: null,
      error: error as PostgrestError,
    };
  }
};
