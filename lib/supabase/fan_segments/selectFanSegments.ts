import serverClient from "../serverClient";
import { Tables } from "@/types/database.types";

type Social = Tables<"socials">;

interface SelectFanSegmentsParams {
  segment_id: string;
}

export const selectFanSegments = async (params: SelectFanSegmentsParams): Promise<Social[]> => {
  try {
    const { data, error } = await serverClient
      .from("fan_segments")
      .select(`socials!fan_segments_fan_social_id_fkey (*)`)
      .eq("segment_id", params.segment_id);

    if (error) {
      console.error("Error fetching fan segments with socials:", error);
      throw error;
    }

    // Extract and flatten the socials data from the joined result
    const socialsData =
      data
        ?.flatMap((item: { socials: Social[] }) => item.socials || [])
        .filter((social): social is Social => social !== null)
        .sort((a, b) => (b.followerCount || 0) - (a.followerCount || 0)) || [];

    return socialsData;
  } catch (error) {
    console.error("Error in selectFanSegments:", error);
    throw error;
  }
};
