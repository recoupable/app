/**
 * Extract file extension from filename (e.g., "report.pdf" -> ".pdf")
 * Returns empty string if no extension found
 *
 * @param fileName
 */
export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1 || lastDot === 0) return "";
  return fileName.slice(lastDot);
}
