import { ACCOUNT_OVERRIDE_STORAGE_KEY } from "@/lib/consts";

const LEGACY_ACCOUNT_OVERRIDE_KEY = "accountOverride";

function migrateLegacyAccountOverrideSessionStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const canonicalId = window.sessionStorage.getItem(
      ACCOUNT_OVERRIDE_STORAGE_KEY,
    );
    const canonicalEmail = window.sessionStorage.getItem(
      `${ACCOUNT_OVERRIDE_STORAGE_KEY}_email`,
    );
    if (canonicalId || canonicalEmail) return;

    const legacyId = window.sessionStorage.getItem(LEGACY_ACCOUNT_OVERRIDE_KEY);
    const legacyEmail = window.sessionStorage.getItem(
      `${LEGACY_ACCOUNT_OVERRIDE_KEY}_email`,
    );
    if (!legacyId && !legacyEmail) return;

    if (legacyId) {
      window.sessionStorage.setItem(ACCOUNT_OVERRIDE_STORAGE_KEY, legacyId);
    }
    if (legacyEmail) {
      window.sessionStorage.setItem(
        `${ACCOUNT_OVERRIDE_STORAGE_KEY}_email`,
        legacyEmail,
      );
    }
    window.sessionStorage.removeItem(LEGACY_ACCOUNT_OVERRIDE_KEY);
    window.sessionStorage.removeItem(`${LEGACY_ACCOUNT_OVERRIDE_KEY}_email`);
  } catch {
    // Ignore quota / private mode errors.
  }
}

/**
 * Reads the stored account override from session storage.
 */
export function getStoredAccountOverride(): {
  accountId: string | null;
  email: string | null;
} {
  if (typeof window === "undefined") return { accountId: null, email: null };
  migrateLegacyAccountOverrideSessionStorage();
  return {
    accountId: window.sessionStorage.getItem(ACCOUNT_OVERRIDE_STORAGE_KEY),
    email: window.sessionStorage.getItem(`${ACCOUNT_OVERRIDE_STORAGE_KEY}_email`),
  };
}
