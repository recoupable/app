import { API_OVERRIDE_STORAGE_KEY, NEW_API_BASE_URL } from "@/lib/consts";

/**
 * Resolves the API base URL for client-side API calls.
 */
export function getClientApiBaseUrl(): string {
  const defaultApiBaseUrl = NEW_API_BASE_URL.replace(/\/+$/, "");

  if (typeof window !== "undefined") {
    try {
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
