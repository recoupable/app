import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { Social } from "@/types/Social";

export interface FansResponse {
  status: string;
  fans: Social[];
  pagination: {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface FansError {
  message: string;
  status?: number;
}

/**
 * Fetches fans for a specific artist from the Recoup API with pagination.
 *
 * Authentication is via Bearer token (Privy access token).
 *
 * @param artistAccountId - The artist account ID to fetch fans for
 * @param accessToken - Privy access token for Bearer auth
 * @param page - Page number (default: 1)
 * @param limit - Page size (default: 20)
 * @returns A paginated FansResponse
 */
export async function fetchArtistFans(
  artistAccountId: string,
  accessToken: string,
  page: number = 1,
  limit: number = 20,
): Promise<FansResponse> {
  try {
    const response = await fetch(
      `${getClientApiBaseUrl()}/api/artists/${artistAccountId}/fans?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const error: FansError = {
        message: "Failed to fetch fans",
        status: response.status,
      };
      throw error;
    }

    const data: FansResponse = await response.json();

    if (data.status !== "success") {
      throw { message: "API returned error status" } as FansError;
    }

    return data;
  } catch (error) {
    // Ensure we're always throwing a consistent error shape
    if (typeof error === "object" && error !== null && "message" in error) {
      throw error;
    }
    throw { message: "An unexpected error occurred" } as FansError;
  }
}
