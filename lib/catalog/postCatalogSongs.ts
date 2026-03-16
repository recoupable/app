import { NEW_API_BASE_URL } from "../consts";
import { CatalogSongsResponse } from "./getCatalogSongs";
import { Tables } from "@/types/database.types";

export interface CatalogSongInput {
  catalog_id: Tables<"catalog_songs">["catalog"];
  isrc: Tables<"catalog_songs">["song"];
  name?: Tables<"songs">["name"];
  album?: Tables<"songs">["album"];
  notes?: Tables<"songs">["notes"];
  artists?: string[];
}

/**
 * Adds songs to a catalog by ISRC in batch
 *
 * @param songs
 */
export async function postCatalogSongs(songs: CatalogSongInput[]): Promise<CatalogSongsResponse> {
  try {
    const response = await fetch(`${NEW_API_BASE_URL}/api/catalogs/songs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ songs }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data: CatalogSongsResponse = await response.json();

    if (data.status === "error") {
      throw new Error(data.error || "Unknown error occurred");
    }

    return data;
  } catch (error) {
    console.error("Error inserting catalog songs:", error);
    throw error;
  }
}
