/**
 * Converts a platform type to a display-friendly name.
 *
 * @param platformType - The platform type (e.g., "SPOTIFY", "TWITTER")
 * @returns Display-friendly platform name (e.g., "Spotify", "Twitter")
 */
const getPlatformDisplayName = (platformType: string): string => {
  const displayNames: Record<string, string> = {
    SPOTIFY: "Spotify",
    TWITTER: "Twitter",
    INSTAGRAM: "Instagram",
    TIKTOK: "TikTok",
    APPPLE: "Apple Music",
    YOUTUBE: "YouTube",
    FACEBOOK: "Facebook",
    THREADS: "Threads",
  };
  return displayNames[platformType] || platformType.charAt(0) + platformType.slice(1).toLowerCase();
};

export default getPlatformDisplayName;
