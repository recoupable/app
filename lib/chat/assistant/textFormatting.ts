/**
 * Formats text content by converting markdown syntax to HTML and formatting lists
 *
 * @param text
 */
export const formatText = (text: string): string => {
  return (
    text
      // Convert **text** to <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Format numbered lists while preserving original numbers
      .replace(
        /(?:\d+\.\s+[^\n]+\n?)+/g,
        match => `<div class="flex flex-col gap-1 my-2">
        ${match
          .split("\n")
          .filter(Boolean)
          .map(
            line => `<div class="flex gap-2">
            <span class="min-w-[20px]">${line.match(/^\d+/)?.[0]}.</span>
            <span>${line.replace(/^\d+\.\s+/, "")}</span>
          </div>`,
          )
          .join("\n")}
      </div>`,
      )
  );
};
