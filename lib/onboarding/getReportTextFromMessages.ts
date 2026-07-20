import type { UIMessage } from "ai";

/**
 * Markdown of the pre-run report: the latest assistant message's text
 * parts joined. Non-text parts (reasoning, tool calls) are skipped —
 * the onboarding step renders only the finished report body.
 */
export function getReportTextFromMessages(messages: UIMessage[]): string {
  const lastAssistant = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");
  if (!lastAssistant) return "";
  return lastAssistant.parts
    .filter(
      (part): part is Extract<UIMessage["parts"][number], { type: "text" }> =>
        part.type === "text" && Boolean(part.text),
    )
    .map((part) => part.text)
    .join("\n\n");
}
