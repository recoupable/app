import { SearchResponse } from "./searchApi";

/**
 *
 * @param response
 */
export function formatSearchResultsAsMarkdown(response: SearchResponse): string {
  const { results } = response;

  if (results.length === 0) {
    return "No search results found.";
  }

  let formatted = `Found ${results.length} search results:\n\n`;

  results.forEach((result, index) => {
    formatted += `### ${index + 1}. ${result.title}\n\n`;
    formatted += `**URL:** ${result.url}\n\n`;

    if (result.date) {
      formatted += `**Published:** ${result.date}\n\n`;
    }

    formatted += `${result.snippet}\n\n`;
    formatted += `---\n\n`;
  });

  return formatted;
}
