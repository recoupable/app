import supabase from "./serverClient";
import { Database } from "../../types/database.types";

export type SpotifyPlayButtonClickedRow =
  Database["public"]["Tables"]["spotify_play_button_clicked"]["Row"];

export interface GetSpotifyPlayButtonClickedParams {
  campaignId: string;
}

export interface GetSpotifyPlayButtonClickedResult {
  rows: SpotifyPlayButtonClickedRow[];
  total: number;
}

/**
 *
 * @param params
 */
export async function getSpotifyPlayButtonClicked(
  params: GetSpotifyPlayButtonClickedParams,
): Promise<GetSpotifyPlayButtonClickedResult> {
  const { campaignId } = params;

  const { data, count, error } = await supabase
    .from("spotify_play_button_clicked")
    .select("*", { count: "exact" })
    .eq("campaignId", campaignId)
    .order("timestamp", { ascending: false });

  if (error) throw error;
  return { rows: data || [], total: count || 0 };
}
