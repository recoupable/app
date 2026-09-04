import { useCallback, useEffect, useState } from "react";
import { downloadMedia } from "@/lib/chat/downloadMedia";
import { mediaDownloadFilename } from "@/lib/chat/mediaDownloadFilename";

interface UseMediaDownloaderOptions {
  /** Absolute media URL, or null when nothing is ready yet. */
  url: string | null;
  /** Name to save as. Defaults to the URL's own last path segment. */
  filename?: string;
  /**
   * Fetch the bytes up front so the first click saves instantly.
   *
   * Only worth it for small assets. Off by default: a generated video is
   * multiple megabytes, and prefetching every clip in a thread would pull
   * them all down just to arm buttons nobody may press.
   */
  prefetch?: boolean;
}

/**
 * Download a generated asset — song, clip or still.
 *
 * One implementation for every media surface in the chat. Generalized from
 * the image-only `useImageDownloader`, which prefetched unconditionally and
 * hardcoded an image filename, and which sat alongside two other hand-rolled
 * download paths (recoupable/app#2052).
 *
 * @returns `handleDownload` plus the button's `isDownloading` / `isReady` state.
 */
export function useMediaDownloader({
  url,
  filename,
  prefetch = false,
}: UseMediaDownloaderOptions) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!url || !prefetch) return;

    let cancelled = false;
    fetch(url)
      .then((response) => (response.ok ? response.blob() : null))
      .then((fetched) => {
        if (!cancelled && fetched) setBlob(fetched);
      })
      .catch(() => {
        // A failed prefetch just means the click pays for the fetch instead.
      });

    return () => {
      cancelled = true;
    };
  }, [url, prefetch]);

  const handleDownload = useCallback(async () => {
    if (!url) return;

    setIsDownloading(true);
    try {
      await downloadMedia(url, filename ?? mediaDownloadFilename(url), blob);
    } finally {
      setIsDownloading(false);
    }
  }, [url, filename, blob]);

  return { isDownloading, isReady: !prefetch || !!blob, handleDownload };
}
