import { getPerplexityApiKey, getPerplexityHeaders, PERPLEXITY_BASE_URL } from "./config";

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  date?: string;
  last_updated?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  id: string;
}

export interface SearchParams {
  query: string;
  max_results?: number;
  max_tokens_per_page?: number;
  country?: string;
  search_domain_filter?: string[];
}

/**
 *
 * @param params
 */
export async function searchPerplexity(params: SearchParams): Promise<SearchResponse> {
  const apiKey = getPerplexityApiKey();
  const url = `${PERPLEXITY_BASE_URL}/search`;

  const body = {
    query: params.query,
    max_results: params.max_results || 10,
    max_tokens_per_page: params.max_tokens_per_page || 1024,
    ...(params.country && { country: params.country }),
    ...(params.search_domain_filter && {
      search_domain_filter: params.search_domain_filter,
    }),
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: getPerplexityHeaders(apiKey),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Perplexity Search API error: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to search Perplexity API: ${error}`);
  }
}
