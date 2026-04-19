/**
 * One-time migration from short-lived sessionStorage keys to namespaced keys.
 */

import {
  API_OVERRIDE_STORAGE_KEY,
  LEGACY_API_OVERRIDE_STORAGE_KEY,
} from "@/lib/consts";

export function migrateApiOverrideSessionStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const canonical = window.sessionStorage.getItem(API_OVERRIDE_STORAGE_KEY);
    if (canonical) return;
    const legacy = window.sessionStorage.getItem(LEGACY_API_OVERRIDE_STORAGE_KEY);
    if (!legacy) return;
    window.sessionStorage.setItem(API_OVERRIDE_STORAGE_KEY, legacy);
    window.sessionStorage.removeItem(LEGACY_API_OVERRIDE_STORAGE_KEY);
  } catch {
    // Ignore quota / private mode errors.
  }
}
