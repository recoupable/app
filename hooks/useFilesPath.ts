"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/**
 *
 * @param base
 */
export default function useFilesPath(base: string) {
  const params = useSearchParams();
  const router = useRouter();
  const baseNormalized = useMemo(() => (base.endsWith("/") ? base : base + "/"), [base]);
  const paramPath = params.get("path");
  const path = paramPath || baseNormalized;

  const normalized = useMemo(() => (path.endsWith("/") ? path : path + "/"), [path]);

  // When base changes (e.g., artist switched), ensure URL path resets under the new base
  useEffect(() => {
    if (!baseNormalized) return;
    const current = params.get("path");
    if (current && current.startsWith(baseNormalized)) return;
    const usp = new URLSearchParams(Array.from(params.entries()));
    usp.set("path", baseNormalized);
    router.replace(`?${usp.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseNormalized]);

  const goTo = (next: string) => {
    const p = next.endsWith("/") ? next : next + "/";
    const usp = new URLSearchParams(Array.from(params.entries()));
    usp.set("path", p);
    router.push(`?${usp.toString()}`);
  };

  const join = (segment: string) => `${normalized}${segment}`;

  const parent = () => {
    const parts = normalized.split("/").filter(Boolean);
    if (parts.length <= 3) return normalized; // files/{owner}/{artist}/
    const up = parts.slice(0, -1).join("/") + "/";
    return up.startsWith("/") ? up.slice(1) : up;
  };

  return { path: normalized, goTo, join, parent };
}
