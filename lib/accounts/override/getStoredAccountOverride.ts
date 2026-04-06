import { ACCOUNT_OVERRIDE_STORAGE_KEY } from "@/lib/consts";

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
    email: window.sessionStorage.getItem(`${ACCOUNT_OVERRIDE_STORAGE_KEY}_email`),
  };
}
