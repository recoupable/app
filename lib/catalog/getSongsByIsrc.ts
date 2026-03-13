/**
 * Fetches songs by ISRC code using the Recoupable API
 */

import { Tables } from "@/types/database.types";

type Song = Tables<"songs">;
type Account = Tables<"accounts">;

export type SongByIsrc = Song & {
  artists: Array<Pick<Account, "id" | "name" | "timestamp">>;
};

export interface SongsByIsrcResponse {
  status: string;
  songs: SongByIsrc[];
  error?: string;
}

/**
 *
 * @param isrc
 */
export async function getSongsByIsrc(isrc: string): Promise<SongsByIsrcResponse> {
  try {
    if (!isrc || isrc.trim() === "") {
      throw new Error("ISRC code is required");
    }

    const params = new URLSearchParams({
      isrc: isrc.trim(),
    });

    const response = await fetch(`https://api.recoupable.com/api/songs?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data: SongsByIsrcResponse = await response.json();

    if (data.status === "error") {
      throw new Error(data.error || "Unknown error occurred");
    }

    return data;
  } catch (error) {
    console.error("Error fetching songs by ISRC:", error);
    throw error;
  }
}
