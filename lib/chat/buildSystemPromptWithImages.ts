/**
 * Appends image URLs to system prompt for GPT to extract for tool parameters
 *
 * @param basePrompt - The base system prompt
 * @param imageUrls - Array of image URLs to append
 * @returns System prompt with image URLs appended (if any)
 */
export function buildSystemPromptWithImages(basePrompt: string, imageUrls: string[]): string {
  if (imageUrls.length === 0) {
    return basePrompt;
  }

  return `${basePrompt}\n\n**ATTACHED IMAGE URLS (for edit_image imageUrl parameter):**\n${imageUrls.map((url, i) => `- Image ${i}: ${url}`).join("\n")}`;
}
