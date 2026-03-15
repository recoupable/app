import { CatalogSongsResult } from "@/components/VercelChat/tools/catalog/CatalogSongsResult";

/**
 * Creates a CatalogSongsResult for error states
 *
 * @param error
 */
export const createErrorResult = (error: Error | null): CatalogSongsResult => ({
  success: false,
  error:
    error instanceof Error ? error.message : error ? "Failed to load songs" : "No data available",
});
