import type { UIMessage } from "ai";

/**
 * Text of the first text part of a ?q= deep-link's initial message —
 * used to prefill the chat input while the workspace provisions, so the
 * click gives instant feedback instead of dead space (chat#1848
 * follow-up). Undefined when there is nothing meaningful to prefill.
 */
export function getInitialMessageText(
  initialMessages?: UIMessage[],
): string | undefined {
  const parts = initialMessages?.[0]?.parts ?? [];
  for (const part of parts) {
    if (part.type === "text" && part.text) return part.text;
  }
  return undefined;
}
