const LEGACY_ACCOUNT_OVERRIDE_KEY = "accountOverride";

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
