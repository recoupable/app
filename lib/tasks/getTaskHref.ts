/**
 * Path of a task's page. Every task click (Schedules tab rows, chat tool
 * task cards, the create toast) lands here (chat#2006 item 8).
 */
export function getTaskHref(taskId: string): string {
  return `/tasks/${taskId}`;
}
