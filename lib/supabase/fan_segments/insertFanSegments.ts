import serverClient from "../serverClient";
import { Tables } from "@/types/database.types";

type FanSegment = Tables<"fan_segments">;
type FanSegmentInsert = Partial<FanSegment>;

export const insertFanSegments = async (fanSegments: FanSegmentInsert[]): Promise<FanSegment[]> => {
  const { data, error } = await serverClient.from("fan_segments").insert(fanSegments).select();

  if (error) {
    console.error("Error inserting fan segments:", error);
    throw error;
  }

  return data;
};
