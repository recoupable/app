const LEGACY_ACCOUNT_OVERRIDE_KEY = "accountOverride";

export function clearLegacyAccountOverrideKeys(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(LEGACY_ACCOUNT_OVERRIDE_KEY);
    window.sessionStorage.removeItem(`${LEGACY_ACCOUNT_OVERRIDE_KEY}_email`);
  } catch {
    // Ignore.
  }
}
