import { ACCOUNT_OVERRIDE_STORAGE_KEY } from "@/lib/consts";

/**
 * Persists an account override to session storage.
 */
export function setStoredAccountOverride(
  accountId: string,
  email: string,
): void {
  window.sessionStorage.setItem(ACCOUNT_OVERRIDE_STORAGE_KEY, accountId);
  window.sessionStorage.setItem(`${ACCOUNT_OVERRIDE_STORAGE_KEY}_email`, email);
}
