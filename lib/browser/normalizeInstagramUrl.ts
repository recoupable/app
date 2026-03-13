/**
 * Normalize Instagram URLs to use www subdomain
 * This helps avoid more aggressive rate limiting on the main domain
 *
 * @param url
 */
export function normalizeInstagramUrl(url: string): string {
  if (!url.includes("instagram.com")) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === "instagram.com") {
      urlObj.hostname = "www.instagram.com";
      return urlObj.toString();
    }
    return url;
  } catch {
    // Fallback for malformed URLs - use safer regex approach
    return url.replace(/^(https?:\/\/)instagram\.com/, "$1www.instagram.com");
  }
}
