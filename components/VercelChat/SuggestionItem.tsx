"use client";

import { useEffect, useMemo, useState } from "react";
import cn from "classnames";
import { GroupedSuggestion } from "@/hooks/useFileMentionSuggestions";
import { ImageIcon } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { getFileContents } from "@/lib/sandboxes/getFileContents";

interface SuggestionItemProps {
  entry: GroupedSuggestion;
  focused: boolean;
  highlightedDisplay: React.ReactNode;
}

const imagePreviewCache = new Map<string, string>();
const imagePreviewInFlight = new Map<string, Promise<string | null>>();

export function SuggestionItem({ 
  entry, 
  focused, 
  highlightedDisplay
}: SuggestionItemProps) {
  const { getAccessToken } = usePrivy();

  // Check for common image extensions if mime_type is missing
  const isImage = useMemo(
    () =>
      entry.mime_type?.startsWith("image/") ||
      /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(entry.path || entry.display || ""),
    [entry.mime_type, entry.path, entry.display],
  );
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    imagePreviewCache.get(entry.path),
  );

  useEffect(() => {
    let cancelled = false;

    const loadPreview = async () => {
      if (!isImage || !entry.path) return;
      const cached = imagePreviewCache.get(entry.path);
      if (cached) {
        if (!cancelled) setImageUrl(cached);
        return;
      }

      let pending = imagePreviewInFlight.get(entry.path);
      if (!pending) {
        pending = (async () => {
          const accessToken = await getAccessToken();
          if (!accessToken) return null;
          const file = await getFileContents(accessToken, entry.path);
          return file.imageUrl;
        })();
        imagePreviewInFlight.set(entry.path, pending);
      }

      try {
        const nextUrl = await pending;
        if (!nextUrl || cancelled) return;
        imagePreviewCache.set(entry.path, nextUrl);
        setImageUrl(nextUrl);
      } catch {
        // Ignore preview errors; keep fallback icon.
      } finally {
        imagePreviewInFlight.delete(entry.path);
      }
    };

    loadPreview();
    return () => {
      cancelled = true;
    };
  }, [entry.path, isImage, getAccessToken]);

  return (
    <div
      className={cn(
        "px-3 py-2 text-[13px] cursor-pointer select-none",
        "flex items-center gap-2 rounded-md",
        focused ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"
      )}
    >
      {isImage ? (
        imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="size-8 rounded object-cover border border-border bg-muted"
          />
        ) : (
          <div className="size-8 rounded bg-muted flex items-center justify-center border border-border">
            <ImageIcon className="size-4 text-muted-foreground" />
          </div>
        )
      ) : (
        <div className="size-2 rounded-full bg-primary/60 shrink-0 ml-1 mr-1" />
      )}
      <span className="truncate">{highlightedDisplay || entry.display}</span>
    </div>
  );
}
