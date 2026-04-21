import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { SongByIsrc } from "@/types/Song";

export interface SongsByIsrcResponse {
  status: string;
  songs: SongByIsrc[];
  error?: string;
}

/**
 * Fetches songs by ISRC code from the Recoup API.
 *
 * Authentication is via Bearer token (Privy access token).
 *
 * @param isrc - The ISRC code to search for.
 * @param accessToken - Privy access token for Bearer auth.
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
