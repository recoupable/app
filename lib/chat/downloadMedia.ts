/**
 * Save a generated asset to disk.
 *
 * The `download` attribute is ignored for cross-origin URLs, and every asset
 * here is cross-origin: music lands on Supabase Storage, video and stills on
 * `fal.media`. A plain link therefore navigated to the file instead of saving
 * it, contradicting the button's label.
 *
 * `?download=` — the fix `lib/music/musicDownloadUrl.ts` uses — is a Supabase
 * Storage feature and is **not** enough on its own: measured 2026-09-03,
 * Supabase answers it with `Content-Disposition: attachment` while fal.media
 * ignores it and still returns a bare `video/mp4`. Both send
 * `Access-Control-Allow-Origin: *`, so fetching the bytes and saving them
 * through an object URL is the one mechanism that works for either origin.
 *
 * Falls back to opening the URL directly if the fetch fails, so a future
 * origin without permissive CORS degrades to the old behaviour rather than
 * doing nothing at all.
 *
 * @param url - Absolute media URL.
 * @param filename - Name to save the file as.
 * @param prefetched - Bytes already in hand, to skip the fetch.
 */
export async function downloadMedia(
  url: string,
  filename: string,
  prefetched?: Blob | null,
): Promise<void> {
  let objectUrl: string | null = null;

  if (prefetched) {
    objectUrl = URL.createObjectURL(prefetched);
  } else {
    try {
      const response = await fetch(url);
      if (response.ok) {
        objectUrl = URL.createObjectURL(await response.blob());
      }
    } catch {
      // Fall through to the direct URL below.
    }
  }

  const anchor = document.createElement("a");
  anchor.href = objectUrl ?? url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  if (objectUrl) URL.revokeObjectURL(objectUrl);
}
