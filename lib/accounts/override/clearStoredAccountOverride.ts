import { ACCOUNT_OVERRIDE_STORAGE_KEY } from "@/lib/consts";
import { clearLegacyAccountOverrideKeys } from "@/lib/sessionStorage/migrateRecoupOverrideKeys";

/**
 * Removes the account override from session storage.
 */
export function clearStoredAccountOverride(): void {
  window.sessionStorage.removeItem(ACCOUNT_OVERRIDE_STORAGE_KEY);
  window.sessionStorage.removeItem(`${ACCOUNT_OVERRIDE_STORAGE_KEY}_email`);
  clearLegacyAccountOverrideKeys();
}
