/** Extract a lowercased hostname from a link that may omit its protocol. */
const hostnameOf = (link: string): string => {
  try {
    const url = new URL(link.includes("://") ? link : `https://${link}`);
    return url.hostname.toLowerCase();
  } catch {
    return link.toLowerCase();
  }
};

/** True when `host` is exactly `domain` or a subdomain of it (boundary-safe). */
const matches = (host: string, domain: string): boolean =>
  host === domain || host.endsWith(`.${domain}`);

const getSocialPlatformByLink = (link: string) => {
  if (!link) return "NONE";
  const host = hostnameOf(link);
  if (matches(host, "x.com") || matches(host, "twitter.com")) return "TWITTER";
  if (matches(host, "instagram.com")) return "INSTAGRAM";
  if (matches(host, "spotify.com")) return "SPOTIFY";
  if (matches(host, "tiktok.com")) return "TIKTOK";
  if (matches(host, "apple.com")) return "APPLE";
  if (matches(host, "youtube.com") || matches(host, "youtu.be")) return "YOUTUBE";
  if (matches(host, "facebook.com")) return "FACEBOOK";
  if (matches(host, "threads.net") || matches(host, "threads.com"))
    return "THREADS";

  return "NONE";
};

export default getSocialPlatformByLink;
