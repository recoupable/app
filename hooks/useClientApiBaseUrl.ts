"use client";
import { useSyncExternalStore } from "react";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import {
  API_OVERRIDE_CHANGE_EVENT,
  API_OVERRIDE_STORAGE_KEY,
  NEW_API_BASE_URL,
} from "@/lib/consts";

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === API_OVERRIDE_STORAGE_KEY)
      onChange();
  };
  window.addEventListener(API_OVERRIDE_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(API_OVERRIDE_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
const serverSnapshot = () => NEW_API_BASE_URL.replace(/\/+$/, "");

/** Same-tab storage writes do not emit native storage events. */
export function useClientApiBaseUrl() {
  return useSyncExternalStore(subscribe, getClientApiBaseUrl, serverSnapshot);
}
