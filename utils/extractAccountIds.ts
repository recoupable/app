/**
 * Extract owner and artist account IDs from storage key
 * Storage key format: files/{ownerAccountId}/{artistAccountId}/path/to/file
 *
 * @param storageKey
 */
export function extractAccountIds(storageKey: string) {
  const parts = storageKey.split("/");
  return {
    ownerAccountId: parts[1] || "",
    artistAccountId: parts[2] || "",
  };
}
