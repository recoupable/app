/**
 * Connector slugs that artists are allowed to connect.
 * Only these connectors will be shown in the artist settings Connectors tab.
 *
 * Why separate from the API's ALLOWED_ARTIST_CONNECTORS: gives the frontend
 * independent control over what's displayed. New connectors can be enabled
 * on the API first and surfaced in the UI when ready.
 */
export const ALLOWED_ARTIST_CONNECTORS = ["tiktok", "instagram"] as const;

export type AllowedArtistConnector = (typeof ALLOWED_ARTIST_CONNECTORS)[number];
