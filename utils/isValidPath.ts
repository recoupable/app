/**
 * Validates a directory path to prevent traversal attacks and security issues
 * More strict than storage key validation - for user-provided directory paths
 *
 * @param path - Directory path to validate
 * @returns true if path is safe to use, false otherwise
 */
export function isValidPath(path: string): boolean {
  if (!path || typeof path !== "string") {
    return false;
  }

  // Reject empty or very long paths
  if (path.length === 0 || path.length > 512) {
    return false;
  }

  // Reject directory traversal patterns
  if (path.includes("..")) {
    return false;
  }

  // Reject current directory references
  if (path.includes("./") || path === ".") {
    return false;
  }

  // Reject backslashes (Windows path separators)
  if (path.includes("\\")) {
    return false;
  }

  // Reject control characters
  if (/[\x00-\x1F\x7F-\x9F]/.test(path)) {
    return false;
  }

  // Reject absolute paths (should not start with /)
  // (This is redundant with normalization but adds defense in depth)
  if (path.startsWith("/")) {
    return false;
  }

  return true;
}

export default isValidPath;
