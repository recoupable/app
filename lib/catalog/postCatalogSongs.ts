import { getClientApiBaseUrl } from "../api/getClientApiBaseUrl";
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
 */
export async function postCatalogSongs(
  songs: CatalogSongInput[],
): Promise<CatalogSongsResponse> {
  try {
    const response = await fetch(
      `${getClientApiBaseUrl()}/api/catalogs/songs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ songs }),
      },
    );

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
