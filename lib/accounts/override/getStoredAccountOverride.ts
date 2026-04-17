import { ACCOUNT_OVERRIDE_STORAGE_KEY } from "@/lib/consts";
import { migrateAccountOverrideSessionStorage } from "@/lib/sessionStorage/migrateRecoupOverrideKeys";

/**
 * Reads the stored account override from session storage.
 */
export function getStoredAccountOverride(): {
  accountId: string | null;
  email: string | null;
} {
  if (typeof window === "undefined") return { accountId: null, email: null };
  migrateAccountOverrideSessionStorage(ACCOUNT_OVERRIDE_STORAGE_KEY);
  return {
    accountId: window.sessionStorage.getItem(ACCOUNT_OVERRIDE_STORAGE_KEY),
    email: window.sessionStorage.getItem(`${ACCOUNT_OVERRIDE_STORAGE_KEY}_email`),
  };
}
