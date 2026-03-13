import { Tables } from "@/types/database.types";
import { GenerateArrayResult } from "../ai/generateArray";

interface CreateArtistSegmentsSuccessData {
  supabase_segments: Tables<"segments">[];
  supabase_artist_segments: Tables<"artist_segments">[];
  segments: GenerateArrayResult[];
  supabase_fan_segments: Tables<"fan_segments">[];
}

export const successResponse = (
  message: string,
  data: CreateArtistSegmentsSuccessData,
  count: number,
) => ({
  success: true,
  status: "success",
  message,
  data,
  count,
});

export const errorResponse = (message: string) => ({
  success: false,
  status: "error",
  message,
  data: [],
  count: 0,
});
