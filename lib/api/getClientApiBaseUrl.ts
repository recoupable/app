import { API_OVERRIDE_STORAGE_KEY, NEW_API_BASE_URL } from "@/lib/consts";
import { migrateApiOverrideSessionStorage } from "@/lib/sessionStorage/migrateRecoupOverrideKeys";

/**
 * Resolves the API base URL for client-side API calls.
 */
export function getClientApiBaseUrl(): string {
  const defaultApiBaseUrl = NEW_API_BASE_URL.replace(/\/+$/, "");

  if (typeof window !== "undefined") {
    try {
      migrateApiOverrideSessionStorage(API_OVERRIDE_STORAGE_KEY);
      const storedApiOverride = window.sessionStorage.getItem(
        API_OVERRIDE_STORAGE_KEY,
      );
      if (storedApiOverride) {
        return storedApiOverride.replace(/\/+$/, "");
      }
    } catch {
      // Ignore storage failures and fall back to default.
    }
  }

  return defaultApiBaseUrl;
}
