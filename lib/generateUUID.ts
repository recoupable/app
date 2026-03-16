/**
 * Generates a UUID v4 compatible string
 * Uses a cryptographically secure method when available (browser)
 * Falls back to a non-secure method for other environments
 *
 * @returns A randomly generated UUID string
 */
export function generateUUID(): string {
  // Use crypto.randomUUID when available (modern browsers)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation for older browsers or Node.js environments
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default generateUUID;
