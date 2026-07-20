import type { SOCIAL } from "@/types/Agent";
import { normalizeSocialPlatform } from "./normalizeSocialPlatform";

/**
 * Finds the id of an artist's social for a platform key. Used after a
 * fix PATCH to locate the replacement social in the refreshed roster so
 * it can be auto-confirmed. Tolerates the legacy "APPPLE" spelling.
 */
export function findSocialIdByPlatform(
  socials: SOCIAL[],
  platform: string,
): string | null {
  const target = normalizeSocialPlatform(platform);
  const match = socials.find(
    (social) => normalizeSocialPlatform(social.type) === target,
  );
  return match?.id ?? null;
}
