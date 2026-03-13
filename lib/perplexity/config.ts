export const PERPLEXITY_BASE_URL = "https://api.perplexity.ai";

/**
 *
 */
export function getPerplexityApiKey(): string {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    throw new Error(
      "PERPLEXITY_API_KEY environment variable is not set. " +
        "Please add it to your environment variables.",
    );
  }

  return apiKey;
}

/**
 *
 * @param apiKey
 */
export function getPerplexityHeaders(apiKey: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}
