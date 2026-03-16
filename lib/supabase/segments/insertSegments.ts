import serverClient from "../serverClient";
import { Tables } from "@/types/database.types";

type Segment = Tables<"segments">;
type SegmentInsert = Partial<Segment>;

export const insertSegments = async (segments: SegmentInsert[]): Promise<Segment[]> => {
  const { data, error } = await serverClient.from("segments").insert(segments).select();

  if (error) {
    console.error("Error inserting segments:", error);
    throw error;
  }

  return data;
};
