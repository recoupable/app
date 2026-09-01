const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Whether a `/projects/{param}` segment names a project. Same guard shape as
 * `lib/tasks/isTaskId.ts`: a non-UUID segment is a not-found rather than a
 * request the API has to answer.
 */
export function isProjectId(param: string): boolean {
  return UUID_PATTERN.test(param);
}
