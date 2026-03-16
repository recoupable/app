/**
 *
 * @param url
 */
export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

/**
 *
 * @param domain
 * @param size
 */
export function getFaviconUrl(domain: string, size: number = 32): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}

/**
 *
 */
export function getFallbackFaviconUrl(): string {
  return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
}
