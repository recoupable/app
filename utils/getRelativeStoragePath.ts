/**
 *
 * @param storageKey
 * @param ownerAccountId
 * @param artistAccountId
 * @param isDirectory
 */
export default function getRelativeStoragePath(
  storageKey: string,
  ownerAccountId: string,
  artistAccountId: string,
  isDirectory?: boolean,
): string {
  const base = `files/${ownerAccountId}/${artistAccountId}/`;
  let rel = storageKey.startsWith(base) ? storageKey.slice(base.length) : storageKey;
  if (isDirectory && !rel.endsWith("/")) rel += "/";
  return rel;
}
