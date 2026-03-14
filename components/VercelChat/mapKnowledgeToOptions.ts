import type { SuggestionDataItem } from "react-mentions";

export const mapKnowledgeToOptions = (
  files: Array<{ url: string; name: string }>,
): SuggestionDataItem[] =>
  (files || [])
    .filter(f => typeof f?.url === "string" && !!f.url)
    .map(f => ({ id: String(f.url), display: String(f.name || f.url) }));

export default mapKnowledgeToOptions;
