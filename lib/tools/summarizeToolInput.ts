/**
 * Turn a tool's raw input args into a short, human "what it's doing this call"
 * string — e.g. a shell command, a search query, a URL, a file path.
 *
 * This is the key to making repeated calls of the same tool (e.g. a "Bash"
 * tool firing five times) read as distinct, intentional steps rather than a
 * frozen loop: each card echoes the specific thing it ran.
 */

// Ordered by how meaningful the value is as a one-line summary.
const PREFERRED_KEYS = [
  "command",
  "cmd",
  "script",
  "query",
  "q",
  "search",
  "search_query",
  "prompt",
  "url",
  "href",
  "link",
  "path",
  "file",
  "file_path",
  "filePath",
  "filename",
  "title",
  "name",
  "text",
  "message",
];

export function summarizeToolInput(input: unknown): string | null {
  if (!input || typeof input !== "object") {
    return typeof input === "string" && input.trim() ? input.trim() : null;
  }
  const obj = input as Record<string, unknown>;

  for (const key of PREFERRED_KEYS) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }

  // Fall back to the first short string value we can find.
  for (const value of Object.values(obj)) {
    if (typeof value === "string" && value.trim() && value.length <= 200) {
      return value.trim();
    }
  }
  return null;
}

export default summarizeToolInput;
