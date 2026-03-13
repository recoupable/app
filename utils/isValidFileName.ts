/**
 * Validates file name for rename operations
 * Prevents security issues and invalid characters
 *
 * @param fileName - File name to validate
 * @returns true if valid, false otherwise
 */
export function isValidFileName(fileName: string): boolean {
  if (!fileName || fileName.length === 0) return false;
  if (fileName.length > 255) return false;

  // No path separators
  if (fileName.includes("/") || fileName.includes("\\")) return false;

  // No path traversal
  if (fileName.includes("..")) return false;

  // No null bytes or other problematic characters
  if (fileName.includes("\0")) return false;

  // No leading/trailing whitespace
  if (fileName.trim() !== fileName) return false;

  // Reserved names (Windows compatibility)
  const reserved = [
    "CON",
    "PRN",
    "AUX",
    "NUL",
    "COM1",
    "COM2",
    "COM3",
    "COM4",
    "COM5",
    "COM6",
    "COM7",
    "COM8",
    "COM9",
    "LPT1",
    "LPT2",
    "LPT3",
    "LPT4",
    "LPT5",
    "LPT6",
    "LPT7",
    "LPT8",
    "LPT9",
  ];

  const nameWithoutExt = fileName.split(".")[0].toUpperCase();
  if (reserved.includes(nameWithoutExt)) return false;

  return true;
}

export default isValidFileName;
