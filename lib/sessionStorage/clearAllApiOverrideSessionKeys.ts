const LEGACY_API_OVERRIDE_KEY = "apiOverride";

/** Clears canonical + legacy API override keys (e.g. `?api=clear`). */
export function clearAllApiOverrideSessionKeys(canonicalKey: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(canonicalKey);
    window.sessionStorage.removeItem(LEGACY_API_OVERRIDE_KEY);
  } catch {
    // Ignore.
  }
}
