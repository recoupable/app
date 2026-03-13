/**
 * Calculate the size of text content in bytes
 *
 * @param content
 */
export function getContentSizeBytes(content: string): number {
  return new TextEncoder().encode(content).length;
}
