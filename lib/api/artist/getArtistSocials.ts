import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

// Response types
export interface Social {
  id: string;
  social_id: string;
  username: string;
  profile_url: string;
  avatar: string | null;
  bio: string | null;
  follower_count: number | null;
  following_count: number | null;
  region: string | null;
  updated_at: string;
}

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
  artist_account_id: string,
  accessToken: string
): Promise<SocialResponse> {
  // Build URL with id as a path segment (RESTful nested route on mono/api).
  const url = `${getClientApiBaseUrl()}/api/artists/${artist_account_id}/socials`;

  // Make the API request with Privy Bearer auth (mono/api requires auth).
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
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
