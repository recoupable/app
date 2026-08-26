const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Whether a `/tasks/{param}` segment names a scheduled task. Task ids are
 * `scheduled_actions` UUIDs; Trigger.dev run ids are `run_`-prefixed, so
 * the two id spaces never collide and no lookup is needed (chat#2006).
 */
export function isTaskId(param: string): boolean {
  return UUID_PATTERN.test(param);
}
