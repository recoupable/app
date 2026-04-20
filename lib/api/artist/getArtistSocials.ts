import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { Social } from "@/types/Social";

export interface SocialResponse {
  success: boolean;
  status: "success" | "error";
  socials: Social[];
  pagination: {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  message?: string;
}

export async function getArtistSocials(
  artist_account_id: string
): Promise<SocialResponse> {
  // Construct URL with query parameters
  const url = new URL(`${getClientApiBaseUrl()}/api/artist/socials`);
  url.searchParams.append("artist_account_id", artist_account_id);

  // Make the API request
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = (await response.json()) as Omit<SocialResponse, "success">;

  return {
    success: true,
    ...data,
  };
}
