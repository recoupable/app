import getSocialPlatformByLink from "@/lib/getSocialPlatformByLink";
import { normalizeSocialPlatform } from "./normalizeSocialPlatform";

export interface SocialFixPayload {
  /** API platform key, e.g. "INSTAGRAM" (Apple normalized to "APPLE"). */
  platform: string;
  /** Body for the existing PATCH /api/artists/{id} `profileUrls` field. */
  profileUrls: Record<string, string>;
}

/**
 * Builds the PATCH payload that replaces an artist's social for the
 * platform detected from a corrected profile URL. Returns null when the
 * URL is empty or doesn't map to a supported platform.
 */
export function buildSocialFixPayload(url: string): SocialFixPayload | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const platform = normalizeSocialPlatform(getSocialPlatformByLink(trimmed));
  if (platform === "NONE") return null;

  return { platform, profileUrls: { [platform]: trimmed } };
}
