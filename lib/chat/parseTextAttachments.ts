import { TextAttachment } from "@/types/textAttachment";

// Uses Pick to extract only the properties we need, following DRY principle
export type ParsedTextAttachment = Pick<TextAttachment, "filename" | "type" | "lineCount">;

export interface ParsedMessageContent {
  textAttachments: ParsedTextAttachment[];
  remainingText: string;
}

const TEXT_ATTACHMENT_REGEX =
  /---\s*(Markdown|CSV)\s+File:\s*([^\n]+?)\s*---\n([\s\S]*?)---\s*End of \1\s*---/g;

/**
 * Parses message text to extract text file attachment sections.
 * Returns the extracted attachments and the remaining text content.
 *
 * @param text
 */
export function parseTextAttachments(text: string): ParsedMessageContent {
  const textAttachments: ParsedTextAttachment[] = [];
  let remainingText = text;

  // Find all text attachment sections
  let match;
  while ((match = TEXT_ATTACHMENT_REGEX.exec(text)) !== null) {
    const [fullMatch, typeLabel, filename, content] = match;
    const type = typeLabel === "Markdown" ? "md" : "csv";
    const lineCount = content.split("\n").length;

    textAttachments.push({
      filename: filename.trim(),
      type,
      lineCount,
    });

    // Remove this section from the remaining text
    remainingText = remainingText.replace(fullMatch, "");
  }

  // Reset regex lastIndex for future calls
  TEXT_ATTACHMENT_REGEX.lastIndex = 0;

  // Clean up extra whitespace from removed sections
  remainingText = remainingText
    .replace(/^\n+/, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { textAttachments, remainingText };
}
