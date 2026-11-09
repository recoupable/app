import type { CatalogSongsResponse } from "./getCatalogSongs";

export interface CatalogSongsResult {
  success: boolean;
  songs?: CatalogSongsResponse["songs"];
  pagination?: CatalogSongsResponse["pagination"];
  total_added?: number;
  message?: string;
  error?: string;
}
