"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  API_OVERRIDE_CHANGE_EVENT,
  API_OVERRIDE_STORAGE_KEY,
} from "@/lib/consts";

export default function ApiOverrideSync() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const apiParam = searchParams.get("api");

    try {
      if (apiParam === "clear") {
        window.sessionStorage.removeItem(API_OVERRIDE_STORAGE_KEY);
        window.dispatchEvent(new Event(API_OVERRIDE_CHANGE_EVENT));
        return;
      }

      if (!apiParam) {
        return;
      }

      const normalizedApiParam = new URL(apiParam)
        .toString()
        .replace(/\/+$/, "");
      window.sessionStorage.setItem(
        API_OVERRIDE_STORAGE_KEY,
        normalizedApiParam,
      );
      window.dispatchEvent(new Event(API_OVERRIDE_CHANGE_EVENT));
    } catch {
      // Ignore invalid URLs and storage failures.
    }
  }, [searchParams]);

  return null;
}
