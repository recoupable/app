import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
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
 * Fetches songs by ISRC code from the Recoup API.
 *
 * Authentication is via Bearer token (Privy access token).
 */
export async function getSongsByIsrc(
  isrc: string,
  accessToken: string,
): Promise<SongsByIsrcResponse> {
  try {
    if (!isrc || isrc.trim() === "") {
      throw new Error("ISRC code is required");
    }

    const params = new URLSearchParams({
      isrc: isrc.trim(),
    });

    const response = await fetch(
      `${getClientApiBaseUrl()}/api/songs?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

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
