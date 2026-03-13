/**
 * Shared interface for Apify scraper results
 */
export interface ApifyScraperResult {
  runId: string;
  datasetId: string;
  error: string | null;
}
