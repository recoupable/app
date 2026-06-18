/**
 * Metadata for each connector.
 */

export interface ConnectorMeta {
  description: string;
}

/**
 * Metadata map for all supported connectors.
 * Keys are connector slugs (lowercase).
 */
export const connectorMetadata: Record<string, ConnectorMeta> = {
  googlesheets: { description: "Read, create, and update spreadsheets" },
  googledrive: { description: "Search, upload, and organize files" },
  googledocs: { description: "Create and edit documents" },
  tiktok: { description: "Post and manage TikTok content" },
  instagram: { description: "Post and manage Instagram content" },
  youtube: { description: "Post and manage YouTube content" },
  twitter: { description: "Post and manage content on X (Twitter)" },
  linkedin: { description: "Post and manage LinkedIn content" },
};

/**
 * Get metadata for a connector by slug.
 * Returns default values if not found.
 */
export function getConnectorMeta(slug: string): ConnectorMeta {
  return (
    connectorMetadata[slug.toLowerCase()] || {
      description: "Connect to enable this connector",
    }
  );
}
