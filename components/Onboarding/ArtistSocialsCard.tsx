"use client";

import { useId } from "react";
import { Minus, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ArtistRecord } from "@/types/Artist";
import { cn } from "@/lib/utils";
import SocialSearchOrPaste from "./SocialSearchOrPaste";

interface ArtistSocialsCardProps {
  artist: ArtistRecord;
  isFixing: boolean;
  expanded: boolean;
  onToggle: () => void;
  onFix: (url: string) => Promise<boolean>;
}

/** A compact roster row; only the active artist exposes its profile editor. */
const ArtistSocialsCard = ({
  artist,
  isFixing,
  expanded,
  onToggle,
  onFix,
}: ArtistSocialsCardProps) => {
  const editorId = useId();
  const name = artist.name || "Untitled artist";
  return (
    <div
      className={cn(
        "transition-colors duration-150",
        expanded && "bg-secondary/65",
      )}
    >
      <div className="flex items-center gap-3 px-5 py-3 sm:gap-4 sm:px-6">
        <Avatar className="size-11 rounded-xl shadow-[0_0_0_1px_var(--border)]">
          <AvatarImage
            src={artist.image || undefined}
            alt=""
            className="object-cover"
          />
          <AvatarFallback className="rounded-xl bg-background font-mono text-sm text-muted-foreground">
            {name
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h2 className="min-w-0 flex-1 truncate text-base font-medium tracking-tight text-foreground">
          {name}
        </h2>
        <button
          type="button"
          disabled={isFixing}
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={editorId}
          aria-label={`${expanded ? "Close" : "Connect"} ${name}`}
          className={cn(
            "flex h-10 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
            expanded
              ? "text-muted-foreground hover:bg-background"
              : "bg-background shadow-[0_0_0_1px_var(--border)] hover:bg-secondary",
          )}
        >
          <span>{expanded ? "Close" : "Connect"}</span>
          {expanded ? (
            <Minus className="size-3.5" aria-hidden="true" />
          ) : (
            <Plus className="size-3.5" aria-hidden="true" />
          )}
        </button>
      </div>
      {expanded && (
        <div id={editorId} className="px-5 pb-4 sm:pl-[84px] sm:pr-6">
          <SocialSearchOrPaste
            pastePlaceholder="Paste a profile link"
            isSubmitting={isFixing}
            onSubmit={onFix}
          />
        </div>
      )}
    </div>
  );
};

export default ArtistSocialsCard;
