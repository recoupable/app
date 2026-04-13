"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { getFileContents } from "@/lib/sandboxes/getFileContents";

interface UseSandboxFilePreviewOptions {
  path?: string;
  mimeType?: string | null;
  enabled?: boolean;
}

interface UseSandboxFilePreviewReturn {
  imageUrl: string | null;
  loading: boolean;
}

const IMAGE_EXT_RE = /\.(png|jpg|jpeg|gif|webp|svg)$/i;

const previewCache = new Map<string, string>();
const inFlight = new Map<string, Promise<string | null>>();

export function useSandboxFilePreview({
  path,
  mimeType,
  enabled = true,
}: UseSandboxFilePreviewOptions): UseSandboxFilePreviewReturn {
  const { getAccessToken } = usePrivy();

  const isImage = useMemo(
    () =>
      Boolean(path) &&
      (mimeType?.startsWith("image/") || IMAGE_EXT_RE.test(path || "")),
    [mimeType, path],
  );

  const [imageUrl, setImageUrl] = useState<string | null>(
    path ? previewCache.get(path) ?? null : null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!enabled || !isImage || !path) {
        if (!cancelled) {
          setLoading(false);
          setImageUrl(null);
        }
        return;
      }

      const cached = previewCache.get(path);
      if (cached) {
        if (!cancelled) {
          setImageUrl(cached);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) setLoading(true);

      let promise = inFlight.get(path);
      if (!promise) {
        promise = (async () => {
          const accessToken = await getAccessToken();
          if (!accessToken) return null;
          const result = await getFileContents(accessToken, path);
          return result.imageUrl;
        })();
        inFlight.set(path, promise);
      }

      try {
        const nextUrl = await promise;
        if (nextUrl) {
          previewCache.set(path, nextUrl);
        }
        if (!cancelled) {
          setImageUrl(nextUrl ?? null);
        }
      } catch {
        if (!cancelled) setImageUrl(null);
      } finally {
        inFlight.delete(path);
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [enabled, isImage, path, getAccessToken]);

  return { imageUrl, loading };
}

export default useSandboxFilePreview;
