/**
 * Format connector slug to human-readable name.
 *
 * Why: Composio returns slugs like "googlesheets" but we need
 * to display "Google Sheets" to users.
 */

const CONNECTOR_DISPLAY_NAMES: Record<string, string> = {
  googlesheets: "Google Sheets",
  googledrive: "Google Drive",
  googledocs: "Google Docs",
  tiktok: "TikTok",
  instagram: "Instagram",
};

export function formatConnectorName(name: string, slug?: string): string {
  const key = (slug || name).toLowerCase();

  if (CONNECTOR_DISPLAY_NAMES[key]) {
    return CONNECTOR_DISPLAY_NAMES[key];
  }

  // Fallback: capitalize and add spaces before capitals
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
