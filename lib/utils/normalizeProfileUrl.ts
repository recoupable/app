// Normalizes a profile URL to match DB and trigger logic
// Removes protocol, leading www., trailing slashes, and lowercases
/**
 *
 * @param url
 */
export default function normalizeProfileUrl(url: string): string {
  if (!url) return "";
  let result = url.trim();
  result = result.replace(/^https?:\/\//i, "");
  result = result.replace(/^www\./i, "");
  result = result.replace(/\/+$/, "");
  return result.toLowerCase();
}
