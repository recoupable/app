import { createSignedUrlForKey } from "./createSignedUrl";

/**
 * Server-side function to fetch file content from storage
 * Uses Supabase storage directly (no API calls needed)
 *
 * @param storageKey
 */
export async function fetchFileContentServer(storageKey: string): Promise<string> {
  // Get signed URL directly from Supabase
  const signedUrl = await createSignedUrlForKey(storageKey, 60); // 1 minute expiry

  // Fetch content from signed URL
  const contentResponse = await fetch(signedUrl);
  if (!contentResponse.ok) {
    throw new Error("Failed to fetch file content from storage");
  }

  return contentResponse.text();
}
