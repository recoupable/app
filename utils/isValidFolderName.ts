/**
 *
 * @param name
 */
export default function isValidFolderName(name: string): boolean {
  if (!name) return false;
  if (name.length > 64) return false;
  if (/[\\/]/.test(name)) return false;
  if (name.includes("..")) return false;
  return /^[\w .-]+$/.test(name);
}
