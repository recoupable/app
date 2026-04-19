import {
  API_OVERRIDE_STORAGE_KEY,
  LEGACY_API_OVERRIDE_STORAGE_KEY,
} from "@/lib/consts";

/** Clears API override from sessionStorage (canonical + legacy key). */
export function clearAllApiOverrideSessionKeys(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(API_OVERRIDE_STORAGE_KEY);
    window.sessionStorage.removeItem(LEGACY_API_OVERRIDE_STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
