/**
 * Removes file mention markup from text for display purposes
 * Converts @[filename](id) to @filename
 *
 * @param text
 */
export function cleanFileMentions(text: string): string {
  // Replace @[display](id) with just @display
  return text.replace(/@\[([^\]]+)\]\([^)]+\)/g, "@$1");
}
