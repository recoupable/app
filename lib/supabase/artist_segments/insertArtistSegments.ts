import serverClient from "../serverClient";
import { Tables } from "@/types/database.types";

type ArtistSegment = Tables<"artist_segments">;
type ArtistSegmentInsert = Partial<ArtistSegment>;

export const insertArtistSegments = async (
  artistSegments: ArtistSegmentInsert[],
): Promise<ArtistSegment[]> => {
  const { data, error } = await serverClient
    .from("artist_segments")
    .insert(artistSegments)
    .select();

  if (error) {
    console.error("Error inserting artist segments:", error);
    throw error;
  }

  return data;
};
