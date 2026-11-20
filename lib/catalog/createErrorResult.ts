import type { CatalogSongsResult } from "@/lib/catalog/CatalogSongsResult";

/**
 * Creates a CatalogSongsResult for error states
 */
export const createErrorResult = (error: Error | null): CatalogSongsResult => ({
  success: false,
  error:
    error instanceof Error
      ? error.message
      : error
        ? "Failed to load songs"
        : "No data available",
});
