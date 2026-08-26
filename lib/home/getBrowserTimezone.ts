/**
 * The browser's IANA timezone, so a "Mondays at 9am" schedule means the
 * user's 9am rather than the API's default zone (chat#2006). Undefined when
 * the runtime can't resolve one; `createTask` then omits `timezone`.
 */
export function getBrowserTimezone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}
