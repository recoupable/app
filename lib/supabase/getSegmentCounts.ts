import { SegmentCount } from "./getArtistSegments";
import supabase from "./serverClient";

/**
 * Get fan counts for a list of segment IDs
 *
 * @param segmentIds
 */
export async function getSegmentCounts(segmentIds: string[]): Promise<SegmentCount[]> {
  try {
    const { data: fanSegments, error: countsError } = await supabase
      .from("fan_segments")
      .select("segment_id")
      .in("segment_id", segmentIds);

    if (countsError) {
      console.error("Error fetching fan counts:", countsError);
      return [];
    }

    const counts = segmentIds.map(segmentId => ({
      segment_id: segmentId,
      count: fanSegments?.filter(fs => fs.segment_id === segmentId).length || 0,
    }));

    return counts;
  } catch (error) {
    console.error("Error in getSegmentCounts:", error);
    return [];
  }
}
