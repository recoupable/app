export const SERPAPI_BASE_URL = "https://serpapi.com";

/**
 *
 */
export function getSerpApiKey(): string {
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "SERPAPI_API_KEY environment variable is not set. " +
        "Please add it to your environment variables.",
    );
  }

  return apiKey;
}
