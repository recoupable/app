/**
 * Connector slugs that artists are allowed to connect.
 * Only these connectors will be shown in the artist settings Connectors tab.
 *
 * This is the source of truth for artist-connector visibility. The API
 * (`GET /api/connectors`) is unopinionated and returns every supported
 * connector; the frontend filters that list down to this allow-list via
 * `useConnectors({ allowedSlugs })`.
 */
export const ALLOWED_ARTIST_CONNECTORS = [
  "tiktok",
  "instagram",
  "youtube",
  "twitter",
  "linkedin",
] as const;

export type AllowedArtistConnector = (typeof ALLOWED_ARTIST_CONNECTORS)[number];
