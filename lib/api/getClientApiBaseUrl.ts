import { NEW_API_BASE_URL } from "@/lib/consts";

const API_OVERRIDE_STORAGE_KEY = "recoup_api_override";

/**
 * Resolves the API base URL on the client using the persisted override when present.
 */
export function getClientApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return NEW_API_BASE_URL;
  }

  const override = window.sessionStorage.getItem(API_OVERRIDE_STORAGE_KEY);
  if (!override) {
    return NEW_API_BASE_URL;
  }

  try {
    new URL(override);
    return override;
  } catch {
    return NEW_API_BASE_URL;
  }
}
