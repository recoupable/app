import { ACCOUNT_OVERRIDE_STORAGE_KEY } from "@/lib/consts";

const LEGACY_ACCOUNT_OVERRIDE_KEY = "accountOverride";

/**
 * Removes the account override from session storage.
 */
export function clearStoredAccountOverride(): void {
  window.sessionStorage.removeItem(ACCOUNT_OVERRIDE_STORAGE_KEY);
  window.sessionStorage.removeItem(`${ACCOUNT_OVERRIDE_STORAGE_KEY}_email`);
  try {
    window.sessionStorage.removeItem(LEGACY_ACCOUNT_OVERRIDE_KEY);
    window.sessionStorage.removeItem(`${LEGACY_ACCOUNT_OVERRIDE_KEY}_email`);
  } catch {
    // Ignore.
  }
}
