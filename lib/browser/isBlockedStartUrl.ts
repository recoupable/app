/**
 * Check if a startURL points to a private or disallowed host
 * Blocks SSRF attacks by rejecting internal/private hosts (IPv4 and IPv6)
 *
 * @param startUrl
 */
export function isBlockedStartUrl(startUrl: string): boolean {
  try {
    const url = new URL(startUrl);

    // Only allow http(s) protocols
    if (!["http:", "https:"].includes(url.protocol)) {
      return true;
    }

    const host = url.hostname.toLowerCase();

    // Block localhost variants
    if (host === "localhost" || host === "0.0.0.0") {
      return true;
    }

    // Block IPv6 localhost and private ranges
    if (host === "::1" || host === "[::1]") return true; // IPv6 localhost
    if (host.startsWith("fc") || host.startsWith("fd")) return true; // fc00::/7 unique local
    if (host.startsWith("fe80:")) return true; // fe80::/10 link-local
    if (host.startsWith("::ffff:127.") || host.startsWith("::ffff:10.")) return true; // IPv4-mapped

    // Block IPv4 private ranges
    if (/^127\.\d+\.\d+\.\d+$/.test(host)) return true; // 127.x.x.x
    if (/^10\.\d+\.\d+\.\d+$/.test(host)) return true; // 10.x.x.x
    if (/^192\.168\.\d+\.\d+$/.test(host)) return true; // 192.168.x.x
    if (/^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(host)) return true; // 172.16-31.x.x
    if (/^169\.254\.\d+\.\d+$/.test(host)) return true; // 169.254.x.x (link-local)

    return false;
  } catch {
    // Invalid URL
    return true;
  }
}
