/**
 * Fetches file content from storage by getting a signed URL and then fetching the content
 *
 * @param storageKey - The storage key of the file to fetch
 * @param accountId - The account ID of the user requesting access
 */
export async function fetchFileContent(storageKey: string, accountId: string): Promise<string> {
  const apiUrl = `/api/files/get-signed-url?key=${encodeURIComponent(storageKey)}&accountId=${encodeURIComponent(accountId)}`;
  const response = await fetch(apiUrl);

  if (!response.ok) throw new Error("Failed to get signed URL");

  const { signedUrl } = await response.json();
  if (!signedUrl) throw new Error("No signed URL returned");

  const contentResponse = await fetch(signedUrl);
  if (!contentResponse.ok) throw new Error("Failed to fetch content");

  return contentResponse.text();
}
