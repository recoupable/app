/** Estimated value band for a catalog, in USD. */
export interface CatalogValuation {
  low: number;
  mid: number;
  high: number;
}

/**
 * The account a catalog belongs to. `is_organization` is true when the owner is
 * an organization the viewer belongs to — the case the avatar exists to make
 * visible. `name` and `image` are nullable: some accounts genuinely have no
 * avatar, so the UI falls back to initials rather than a broken image.
 */
export interface CatalogOwner {
  id: string;
  name: string | null;
  image: string | null;
  is_organization: boolean;
}

export interface Catalog {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  /** Songs with at least one play-count measurement; 0 means valuation is null. */
  measured_song_count?: number;
  /** Null when nothing in the catalog has been measured — never render this as $0. */
  valuation?: CatalogValuation | null;
  owner?: CatalogOwner | null;
}
