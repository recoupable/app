/** Enabled scheduled tasks, the number the plan's task cap counts. */
export function countEnabledTasks(tasks: { enabled: boolean | null }[] | undefined): number {
  return tasks?.filter((task) => task.enabled === true).length ?? 0;
}
