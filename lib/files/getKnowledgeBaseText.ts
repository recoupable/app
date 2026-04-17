import type { Knowledge } from "@/types/knowledge";

/**
 * Processes knowledge base files and extracts text content.
 * Filters for text-based file types and fetches their content from URLs.
 *
 * @param knowledges - Array of knowledge base entries with name, url, and type properties
 * @returns Combined text content from all text-based knowledge files, or undefined if no valid files found
 */
export async function getKnowledgeBaseText(
  knowledges: unknown
): Promise<string | undefined> {
  if (!knowledges || !Array.isArray(knowledges) || knowledges.length === 0) {
    return undefined;
  }

  const textTypes = new Set([
    "text/plain",
    "text/markdown",
    "application/json",
    "text/csv",
  ]);

  const knowledgeFiles = knowledges as Knowledge[];

  const texts = await Promise.all(
    knowledgeFiles
      .filter((f) => f.type && textTypes.has(f.type) && f.url)
      .map(async (f) => {
        try {
          const res = await fetch(f.url!);
          if (!res.ok) return "";
          const content = await res.text();
          return `--- ${f.name || "Unknown"} ---\n${content}`;
        } catch {
          return "";
        }
      })
  );

  const combinedText = texts.filter(Boolean).join("\n\n");
  return combinedText || undefined;
}
