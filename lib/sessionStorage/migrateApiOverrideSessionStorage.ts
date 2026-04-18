/**
 * One-time migration from short-lived sessionStorage keys to namespaced keys.
 */

const LEGACY_API_OVERRIDE_KEY = "apiOverride";

export function migrateApiOverrideSessionStorage(
  canonicalKey: string,
): void {
  if (typeof window === "undefined") return;
  try {
    const canonical = window.sessionStorage.getItem(canonicalKey);
    if (canonical) return;
    const legacy = window.sessionStorage.getItem(LEGACY_API_OVERRIDE_KEY);
    if (!legacy) return;
    window.sessionStorage.setItem(canonicalKey, legacy);
    window.sessionStorage.removeItem(LEGACY_API_OVERRIDE_KEY);
  } catch {
    // Ignore quota / private mode errors.
  }
}
