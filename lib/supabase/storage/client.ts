"use client";

/**
 *
 * @param storageKey
 */
export async function createSignedUrlClient(storageKey: string): Promise<string> {
  try {
    const res = await fetch("/api/storage/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storageKey }),
    });

    if (!res.ok) {
      // Silently fail on error to avoid console spam in production
      return "";
    }

    const data = await res.json();
    return data.signedUrl || "";
  } catch {
    // Silently fail on error
    return "";
  }
}

/**
 *
 * @param storageKeys
 */
export async function createBatchSignedUrlsClient(
  storageKeys: string[],
): Promise<Record<string, string>> {
  if (storageKeys.length === 0) return {};

  try {
    const res = await fetch("/api/storage/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storageKeys }),
    });

    if (!res.ok) {
      // Silently fail on error
      return {};
    }

    const data = await res.json();
    return data.signedUrls || {};
  } catch {
    // Silently fail on error
    return {};
  }
}
