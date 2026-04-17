/**
 * One-time migration from short-lived sessionStorage keys to namespaced keys.
 * Prevents silent loss when keys were briefly changed to generic names.
 */

const LEGACY_API_OVERRIDE_KEY = "apiOverride";
const LEGACY_ACCOUNT_OVERRIDE_KEY = "accountOverride";

export function migrateApiOverrideSessionStorage(
  canonicalKey: string,
): void {
  if (typeof window === "undefined") return;
  try {
    const canonical = window.sessionStorage.getItem(canonicalKey);
    if (canonical) return;
    const legacy = window.sessionStorage.getItem(LEGACY_API_OVERRIDE_KEY);
    if (!legacy) return;
    window.sessionStorage.setItem(canonicalKey, legacy);
    window.sessionStorage.removeItem(LEGACY_API_OVERRIDE_KEY);
  } catch {
    // Ignore quota / private mode errors.
  }
}

export function migrateAccountOverrideSessionStorage(
  canonicalKey: string,
): void {
  if (typeof window === "undefined") return;
  try {
    const canonicalId = window.sessionStorage.getItem(canonicalKey);
    const canonicalEmail = window.sessionStorage.getItem(
      `${canonicalKey}_email`,
    );
    if (canonicalId || canonicalEmail) return;

    const legacyId = window.sessionStorage.getItem(LEGACY_ACCOUNT_OVERRIDE_KEY);
    const legacyEmail = window.sessionStorage.getItem(
      `${LEGACY_ACCOUNT_OVERRIDE_KEY}_email`,
    );
    if (!legacyId && !legacyEmail) return;

    if (legacyId) {
      window.sessionStorage.setItem(canonicalKey, legacyId);
    }
    if (legacyEmail) {
      window.sessionStorage.setItem(`${canonicalKey}_email`, legacyEmail);
    }
    window.sessionStorage.removeItem(LEGACY_ACCOUNT_OVERRIDE_KEY);
    window.sessionStorage.removeItem(`${LEGACY_ACCOUNT_OVERRIDE_KEY}_email`);
  } catch {
    // Ignore quota / private mode errors.
  }
}

export function clearLegacyAccountOverrideKeys(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(LEGACY_ACCOUNT_OVERRIDE_KEY);
    window.sessionStorage.removeItem(`${LEGACY_ACCOUNT_OVERRIDE_KEY}_email`);
  } catch {
    // Ignore.
  }
}

/** Clears all legacy override keys (account + API). */
export function clearLegacyOverrideKeys(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(LEGACY_API_OVERRIDE_KEY);
    clearLegacyAccountOverrideKeys();
  } catch {
    // Ignore.
  }
}

/** Clears canonical + legacy API override keys (e.g. `?api=clear`). */
export function clearAllApiOverrideSessionKeys(canonicalKey: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(canonicalKey);
    window.sessionStorage.removeItem(LEGACY_API_OVERRIDE_KEY);
  } catch {
    // Ignore.
  }
}
