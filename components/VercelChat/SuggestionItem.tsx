"use client";

import cn from "classnames";
import { GroupedSuggestion } from "@/hooks/useFileMentionSuggestions";
import { ImageIcon } from "lucide-react";

interface SuggestionItemProps {
  entry: GroupedSuggestion;
  focused: boolean;
  highlightedDisplay: React.ReactNode;
}

export function SuggestionItem({ 
  entry, 
  focused, 
  highlightedDisplay
}: SuggestionItemProps) {
  // Check for common image extensions if mime_type is missing
  const isImage =
    entry.mime_type?.startsWith("image/") ||
    /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(entry.path || entry.display || "");

  return (
    <div
      className={cn(
        "px-3 py-2 text-[13px] cursor-pointer select-none",
        "flex items-center gap-2 rounded-md",
        focused ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"
      )}
    >
      {isImage ? (
        <div className="size-8 rounded bg-muted flex items-center justify-center border border-border">
          <ImageIcon className="size-4 text-muted-foreground" />
        </div>
      ) : (
        <div className="size-2 rounded-full bg-primary/60 shrink-0 ml-1 mr-1" />
      )}
      <span className="truncate">{highlightedDisplay || entry.display}</span>
    </div>
  );
}
