import { TextAttachment } from "@/types/textAttachment";

/**
 * Formats text attachments into a string to prepend to message content.
 * Each file is wrapped with labeled delimiters for the AI to understand context.
 *
 * @param attachments
 */
export function formatTextAttachments(attachments: TextAttachment[]): string {
  if (attachments.length === 0) return "";

  return attachments
    .map(t => {
      const label = t.type === "md" ? "Markdown" : "CSV";
      return `--- ${label} File: ${t.filename} ---\n${t.content}\n--- End of ${label} ---`;
    })
    .join("\n\n");
}
