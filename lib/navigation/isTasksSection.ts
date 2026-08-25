/**
 * Whether the sidebar's Tasks item should read as active for a pathname.
 * Covers the task list, task pages, and run pages, which moved to
 * `/runs/{runId}` in chat#2006 and would otherwise unlight the item.
 */
export function isTasksSection(pathname: string): boolean {
  return pathname.startsWith("/tasks") || pathname.startsWith("/runs");
}
