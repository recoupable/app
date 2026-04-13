"use client";

import { GroupedSuggestion } from "@/hooks/useFileMentionSuggestions";

export function useBatchSignedUrls(suggestions: GroupedSuggestion[]) {
  void suggestions;
  // Mentions now use sandbox file paths instead of storage keys, so this hook
  // intentionally returns no image previews.
  return {} as Record<string, string>;
}
