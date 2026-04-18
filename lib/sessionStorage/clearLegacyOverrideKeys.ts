import { clearLegacyAccountOverrideKeys } from "@/lib/sessionStorage/clearLegacyAccountOverrideKeys";

const LEGACY_API_OVERRIDE_KEY = "apiOverride";

/** Clears all legacy override keys (account + API). */
export function clearLegacyOverrideKeys(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(LEGACY_API_OVERRIDE_KEY);
    clearLegacyAccountOverrideKeys();
  } catch {
    // Ignore.
  }
}
