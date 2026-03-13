"use client";

import { useState, useEffect } from "react";
import { createBatchSignedUrlsClient } from "@/lib/supabase/storage/client";
import { GroupedSuggestion } from "@/hooks/useFileMentionSuggestions";

/**
 *
 * @param suggestions
 */
export function useBatchSignedUrls(suggestions: GroupedSuggestion[]) {
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const imagesToFetch: string[] = [];

    suggestions.forEach(entry => {
      const isImage =
        entry.mime_type?.startsWith("image/") ||
        /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(entry.storage_key || entry.display || "");

      // If it's an image and we don't have the URL yet, add to fetch list
      if (isImage && entry.storage_key && !signedUrls[entry.storage_key]) {
        imagesToFetch.push(entry.storage_key);
      }
    });

    if (imagesToFetch.length > 0) {
      createBatchSignedUrlsClient(imagesToFetch).then(newUrls => {
        setSignedUrls(prev => ({ ...prev, ...newUrls }));
      });
    }
  }, [suggestions, signedUrls]);

  return signedUrls;
}
