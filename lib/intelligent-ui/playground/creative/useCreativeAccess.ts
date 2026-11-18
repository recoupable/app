"use client";
import { useCallback, useSyncExternalStore } from "react";
import type { CreativeAsset } from "./types";

/** Deadlines restrict fixture access; they never grant account authority. */
export function useCreativeAccess(assets: CreativeAsset[]) {
  const snapshot = useCallback(() => {
    const now = Date.now();
    return assets
      .map((asset) =>
        asset.accessExpiresAt !== undefined &&
        (!Number.isFinite(asset.accessExpiresAt) ||
          asset.accessExpiresAt <= now)
          ? "1"
          : "0",
      )
      .join("");
  }, [assets]);
  const subscribe = useCallback(
    (changed: () => void) => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const check = () => {
        clearTimeout(timer);
        changed();
        const now = Date.now();
        const deadlines = assets
          .filter((asset) => asset.status === "available")
          .map((asset) => asset.accessExpiresAt)
          .filter(
            (value): value is number => Number.isFinite(value) && value! > now,
          );
        if (deadlines.length)
          timer = setTimeout(
            check,
            Math.min(2147483647, Math.max(0, Math.min(...deadlines) - now)),
          );
      };
      check();
      window.addEventListener("focus", check);
      document.addEventListener("visibilitychange", check);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("focus", check);
        document.removeEventListener("visibilitychange", check);
      };
    },
    [assets],
  );
  const expired = useSyncExternalStore(subscribe, snapshot, () =>
    assets
      .map((asset) => (asset.accessExpiresAt === undefined ? "0" : "1"))
      .join(""),
  );
  return assets.map(
    (asset, index): CreativeAsset =>
      asset.status === "available" && expired[index] === "1"
        ? { ...asset, status: "expired" }
        : asset,
  );
}
