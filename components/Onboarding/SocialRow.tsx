"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import getSocialPlatformByLink from "@/lib/getSocialPlatformByLink";
import { getSocialFollowerCount } from "@/lib/onboarding/getSocialFollowerCount";
import getPlatformDisplayName from "@/lib/socials/getPlatformDisplayName";
import formatFollowerCount from "@/lib/utils/formatFollowerCount";
import SocialFixForm from "./SocialFixForm";
import type { SOCIAL } from "@/types/Agent";

interface SocialRowProps {
  social: SOCIAL;
  isSubmitting: boolean;
  onFix: (url: string) => Promise<boolean>;
}

/**
 * One auto-matched social, accepted by default: platform · handle ·
 * followers, with an Edit affordance that reveals a paste-the-correct-link
 * form for the rare wrong match. No confirm step — leaving it as-is is the
 * confirmation.
 */
const SocialRow = ({ social, isSubmitting, onFix }: SocialRowProps) => {
  const [editing, setEditing] = useState(false);
  const platform = getPlatformDisplayName(
    getSocialPlatformByLink(social.link || ""),
  );
  const followerCount = getSocialFollowerCount(social);
  const handle = social.username
    ? social.username.startsWith("@")
      ? social.username
      : `@${social.username}`
    : social.link;

  const handleFix = async (url: string) => {
    const saved = await onFix(url);
    if (saved) setEditing(false);
    return saved;
  };

  return (
    <div className="py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-card-foreground">{platform}</p>
          <p className="text-xs text-muted-foreground truncate">
            {handle}
            {followerCount !== null &&
              ` · ${formatFollowerCount(followerCount)} followers`}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="shrink-0 text-muted-foreground"
          aria-label={`Edit ${platform} link`}
          aria-expanded={editing}
          onClick={() => setEditing((open) => !open)}
        >
          <Pencil className="size-4" />
        </Button>
      </div>
      {editing && (
        <div className="mt-2">
          <SocialFixForm
            placeholder="Paste the correct profile link"
            isSubmitting={isSubmitting}
            onSubmit={handleFix}
          />
        </div>
      )}
    </div>
  );
};

export default SocialRow;
