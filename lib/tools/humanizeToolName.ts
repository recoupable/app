/**
 * Convert a raw tool name into a human-readable, title-cased label.
 * Single source of truth shared by tool cards (ToolError, GenericSuccess) and
 * getToolInfo so the same transform isn't reimplemented per call site.
 *
 * e.g. "COMPOSIO_MANAGE_CONNECTIONS" -> "Manage Connections"
 *      "get_spotify_album"           -> "Get Spotify Album"
 */
export function humanizeToolName(name?: string): string {
  if (!name) return "Action";
  return name
    .replace(/^COMPOSIO_/, "")
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default humanizeToolName;
