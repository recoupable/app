/**
 * Subscribers notified when a prompt is dismissed, so every mounted prompt
 * (the usage page and the account modal can both be open) hides together.
 */
export const dismissalListeners = new Set<() => void>();
