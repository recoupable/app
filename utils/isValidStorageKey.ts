/**
 * Validates storage key format for Supabase storage
 * Prevents path traversal and other security issues
 *
 * @param key
 */
export function isValidStorageKey(key: string): boolean {
  if (!key || key.length > 1024) return false;
  if (key.startsWith("/")) return false;
  if (key.includes("..")) return false;
  if (key.includes("\\")) return false;
  return true;
}
export default isValidStorageKey;
