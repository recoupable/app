import serverClient from "../serverClient";
import { Tables } from "@/types/database.types";

type Segment = Tables<"segments">;

export const deleteSegments = async (artist_account_id: string): Promise<Segment[]> => {
  // First, get all segment_ids associated with the artist from artist_segments table
  const { data: artistSegments, error: artistSegmentsError } = await serverClient
    .from("artist_segments")
    .select("segment_id")
    .eq("artist_account_id", artist_account_id);

  if (artistSegmentsError) {
    console.error("Error fetching artist segments:", artistSegmentsError);
    return [];
  }

  if (!artistSegments || artistSegments.length === 0) {
    // No segments to delete
    return [];
  }

  // Extract segment_ids
  const segmentIds = artistSegments.map((as: { segment_id: string }) => as.segment_id);

  // Delete the segments from the segments table
  const { data, error } = await serverClient
    .from("segments")
    .delete()
    .in("id", segmentIds)
    .select();

  if (error) {
    console.error("Error deleting segments:", error);
    return [];
  }

  if (!data || data.length === 0) {
    console.warn(`No segments found with ids: ${segmentIds.join(", ")}`);
    return [];
  }

  return data;
};
