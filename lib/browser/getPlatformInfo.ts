import { detectPlatform } from "./detectPlatform";

/**
 * Get platform name and emoji for display
 *
 * @param url
 */
export function getPlatformInfo(url?: string) {
  const platform = detectPlatform(url);

  const platformEmojis: Record<string, string> = {
    instagram: "📷",
    facebook: "👥",
    x: " ",
    youtube: "▶️",
    tiktok: " ",
    threads: "🧵",
    browser: "🌐",
  };

  return {
    name: platform,
    emoji: platformEmojis[platform] || "🌐",
  };
}
