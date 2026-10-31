import { isChatIntelligentUIEnabled } from "@/lib/intelligent-ui/chat/isChatIntelligentUIEnabled";

import type { CatalogQueryInput } from "@/lib/intelligent-ui/chat/getChatCatalogHost";

export function getChatPath(
  sessionId: string,
  chatId: string,
  catalogId?: string | string[],
  catalogQuery?: CatalogQueryInput,
): string {
  const path = `/sessions/${sessionId}/chats/${chatId}`;
  if (!isChatIntelligentUIEnabled() || catalogId === undefined) return path;
  // Retain invalid/repeated explicit input too, so a URL update cannot turn a
  // rejected catalog into an implicit artist context on the next visit.
  const query = new URLSearchParams();
  const fields = {
    catalogId,
    since: catalogQuery?.since,
    days: catalogQuery?.days,
    page: catalogQuery?.page,
    limit: catalogQuery?.limit,
  };
  for (const [key, input] of Object.entries(fields)) {
    if (input === undefined) continue;
    const values = Array.isArray(input) ? [...input] : [input];
    // A one-element raw array was rejected by admission. Keep it repeated on
    // reopen instead of silently turning it into a valid scalar.
    if (Array.isArray(input) && values.length === 1) values.push("");
    for (const value of values.length ? values : [""]) query.append(key, value);
  }
  return `${path}?${query}`;
}
