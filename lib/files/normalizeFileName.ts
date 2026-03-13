/**
 * Normalize filename by adding .md extension if no extension is present
 * Ensures consistency between file creation and file lookup operations
 * Dotfiles (hidden files starting with '.') are returned unchanged
 *
 * @param fileName - Original filename provided by user
 * @returns Normalized filename with extension
 *
 * @example
 * normalizeFileName("notes") => "notes.md"
 * normalizeFileName("report.pdf") => "report.pdf"
 * normalizeFileName("data.json") => "data.json"
 * normalizeFileName(".gitignore") => ".gitignore"
 */
export function normalizeFileName(fileName: string): string {
  // Guard: return dotfiles (hidden files) unchanged
  if (fileName.startsWith(".")) {
    return fileName;
  }

  const hasExtension = fileName.includes(".") && fileName.lastIndexOf(".") > 0;

  if (!hasExtension) {
    return `${fileName}.md`;
  }

  return fileName;
}
