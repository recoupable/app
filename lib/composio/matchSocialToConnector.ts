import type { Social } from "@/lib/api/artist/getArtistSocials";

const CONNECTOR_SOCIAL_DOMAINS: Record<string, string> = {
  instagram: "instagram.com",
  tiktok: "tiktok.com",
};

/**
 * Find the matching social profile for a connector slug.
 */
export function matchSocialToConnector(
  slug: string,
  socials: Social[],
): Social | undefined {
  const domain = CONNECTOR_SOCIAL_DOMAINS[slug];
  if (!domain) return undefined;
  return socials.find((s) => s.profile_url?.toLowerCase().includes(domain));
}
