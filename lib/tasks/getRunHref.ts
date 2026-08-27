/**
 * Path of a single run's page. Runs live at the top-level `/runs/{runId}`
 * route: a run is not owned by a task (the run object carries no task id),
 * and `/tasks/{id}` is the task page (chat#2006 item 2).
 */
export function getRunHref(runId: string): string {
  return `/runs/${runId}`;
}
