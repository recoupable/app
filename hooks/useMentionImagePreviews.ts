"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { GroupedSuggestion } from "@/hooks/useFileMentionSuggestions";
import getMimeFromPath from "@/lib/files/getMimeFromPath";

interface SandboxFileResponse {
  status: "success" | "error";
  content?: string;
  encoding?: "base64";
}

const IMAGE_EXT_RE = /\.(png|jpg|jpeg|gif|webp|svg)$/i;

const isImageSuggestion = (entry: GroupedSuggestion) =>
  entry.mime_type?.startsWith("image/") || IMAGE_EXT_RE.test(entry.path || "");

export function useMentionImagePreviews(suggestions: GroupedSuggestion[]) {
  const { getAccessToken } = usePrivy();
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const visibleImagePaths = suggestions
        .filter(isImageSuggestion)
        .slice(0, 8)
        .map((s) => s.path)
        .filter((path) => path && !previewUrls[path]);

      if (visibleImagePaths.length === 0) return;

      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const results = await Promise.all(
        visibleImagePaths.map(async (path) => {
          try {
            const response = await fetch(
              `${getClientApiBaseUrl()}/api/sandboxes/file?path=${encodeURIComponent(path)}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              },
            );

            const data = (await response.json()) as SandboxFileResponse;
            if (!response.ok || data.status === "error" || !data.content) {
              return null;
            }

            if (data.encoding !== "base64") return null;

            const mimeType = getMimeFromPath(path);
            return { path, url: `data:${mimeType};base64,${data.content}` };
          } catch {
            return null;
          }
        }),
      );

      const mapped = results.filter((r): r is { path: string; url: string } => Boolean(r));
      if (!mapped.length || cancelled) return;

      setPreviewUrls((prev) => {
        const next = { ...prev };
        for (const item of mapped) next[item.path] = item.url;
        return next;
      });
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [suggestions, previewUrls, getAccessToken]);

  return previewUrls;
}

export default useMentionImagePreviews;
