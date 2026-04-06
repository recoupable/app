import { ACCOUNT_OVERRIDE_STORAGE_KEY } from "@/lib/consts";

const EMAIL_KEY = `${ACCOUNT_OVERRIDE_STORAGE_KEY}_email`;

/**
 * Reads the stored account override from session storage.
 */
export function getStoredAccountOverride(): {
  accountId: string | null;
  email: string | null;
} {
  if (typeof window === "undefined") return { accountId: null, email: null };
  return {
    accountId: window.sessionStorage.getItem(ACCOUNT_OVERRIDE_STORAGE_KEY),
    email: window.sessionStorage.getItem(EMAIL_KEY),
  };
}

/**
 * Persists an account override to session storage.
 */
export function setStoredAccountOverride(
  accountId: string,
  email: string,
): void {
  window.sessionStorage.setItem(ACCOUNT_OVERRIDE_STORAGE_KEY, accountId);
  window.sessionStorage.setItem(EMAIL_KEY, email);
}

/**
 * Removes the account override from session storage.
 */
export function clearStoredAccountOverride(): void {
  window.sessionStorage.removeItem(ACCOUNT_OVERRIDE_STORAGE_KEY);
  window.sessionStorage.removeItem(EMAIL_KEY);
}
