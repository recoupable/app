"use client";

import { useEffect, useState } from "react";
import { createSignedUrlClient } from "@/lib/supabase/storage/client";

/**
 *
 * @param storageKey
 */
export default function useSignedUrl(storageKey?: string) {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!storageKey) {
      setUrl(undefined);
      return;
    }

    let isMounted = true;
    createSignedUrlClient(storageKey).then(signed => {
      if (isMounted) setUrl(signed);
    });

    return () => {
      isMounted = false;
    };
  }, [storageKey]);

  return url;
}
