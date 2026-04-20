"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { API_OVERRIDE_STORAGE_KEY } from "@/lib/consts";

export default function ApiOverrideSync() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const apiParam = searchParams.get("api");

    try {
      if (apiParam === "clear") {
        window.sessionStorage.removeItem(API_OVERRIDE_STORAGE_KEY);
        return;
      }

      if (!apiParam) {
        return;
      }

      const normalizedApiParam = new URL(apiParam).toString().replace(/\/+$/, "");
      window.sessionStorage.setItem(API_OVERRIDE_STORAGE_KEY, normalizedApiParam);
    } catch {
      // Ignore invalid URLs and storage failures.
    }
  }, [searchParams]);

  return null;
}
