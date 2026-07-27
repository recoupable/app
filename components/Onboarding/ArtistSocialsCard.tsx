"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { ArtistRecord } from "@/types/Artist";
import SocialRow from "./SocialRow";
import SocialSearchOrPaste from "./SocialSearchOrPaste";

interface ArtistSocialsCardProps {
  artist: ArtistRecord;
  isFixing: boolean;
  onFix: (url: string) => Promise<boolean>;
  onRemove: (socialId: string) => Promise<boolean>;
  /** Open on mount — used when the roster has a single artist. */
  defaultOpen?: boolean;
}

/**
 * Per-artist socials, accepted by default: each auto-matched profile is
 * shown with an Edit affordance to fix a wrong match; an artist with no
 * matches gets a soft nudge to add one. No confirm/none step — the step
 * proceeds regardless (see VerifySocialsStep).
 *
 * Collapsed into a per-artist panel (chat#1889): every artist's socials were
 * expanded at once, so a manager with a real roster faced an unscannable wall.
 * A single-artist roster opens by default, since there is nothing to traverse.
 */
const ArtistSocialsCard = ({
  artist,
  isFixing,
  onFix,
  onRemove,
  defaultOpen = false,
}: ArtistSocialsCardProps) => {
  const socials = artist.account_socials ?? [];
  const [adding, setAdding] = useState(false);

  const handleAdd = async (url: string) => {
    const saved = await onFix(url);
    if (saved) setAdding(false);
    return saved;
  };

  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className="p-4 rounded-xl border border-border bg-card"
    >
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 text-left">
        <span className="min-w-0">
          <span className="block font-medium text-card-foreground truncate">
            {artist.name || "Untitled artist"}
          </span>
          <span className="block text-xs text-muted-foreground">
            {socials.length === 0
              ? "No profiles matched"
              : `${socials.length} ${socials.length === 1 ? "profile" : "profiles"}`}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            "group-data-[state=open]:rotate-180",
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="flex flex-col gap-2 pt-3">
        {socials.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No profiles were auto-matched for {artist.name || "this artist"}.
            Adding one is optional, and you can continue without it.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {socials.map((social) => (
              <SocialRow
                key={social.id}
                social={social}
                isSubmitting={isFixing}
                onFix={onFix}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}

        {/* Always available: a matched-social list can still be missing platforms. */}
        {adding ? (
          <SocialSearchOrPaste
            pastePlaceholder="Paste a profile link"
            isSubmitting={isFixing}
            onSubmit={handleAdd}
          />
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => setAdding(true)}
          >
            Add a profile
          </Button>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ArtistSocialsCard;
