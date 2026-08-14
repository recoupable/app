"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import getSocialPlatformByLink from "@/lib/getSocialPlatformByLink";
import { getSocialFollowerCount } from "@/lib/onboarding/getSocialFollowerCount";
import getPlatformDisplayName from "@/lib/socials/getPlatformDisplayName";
import formatFollowerCount from "@/lib/utils/formatFollowerCount";
import SocialRowActions from "./SocialRowActions";
import SocialSearchOrPaste from "./SocialSearchOrPaste";
import type { SOCIAL } from "@/types/Agent";

interface SocialRowProps {
  social: SOCIAL;
  isSubmitting: boolean;
  onFix: (url: string) => Promise<boolean>;
  onRemove: (socialId: string) => Promise<boolean>;
}

/**
 * One auto-matched social, accepted by default: platform · handle ·
 * followers, with an Edit affordance that reveals a paste-the-correct-link
 * form for the rare wrong match. No confirm step — leaving it as-is is the
 * confirmation.
 *
 * Remove is the other half (chat#1889): the step previously only added or
 * replaced, so a profile the user did not want could not be taken back.
 */
const SocialRow = ({
  social,
  isSubmitting,
  onFix,
  onRemove,
}: SocialRowProps) => {
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
  const initial = (social.username || platform || "?")
    .replace(/^@/, "")
    .charAt(0)
    .toUpperCase();

  const handleFix = async (url: string) => {
    const saved = await onFix(url);
    if (saved) setEditing(false);
    return saved;
  };

  return (
    <div className="py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-9 shrink-0">
            {social.avatar ? (
              <AvatarImage src={social.avatar} alt="" />
            ) : null}
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium text-card-foreground">
              {platform}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {handle}
              {followerCount !== null &&
                ` · ${formatFollowerCount(followerCount)} followers`}
            </p>
          </div>
        </div>
        <SocialRowActions
          platform={platform}
          editing={editing}
          isSubmitting={isSubmitting}
          onToggleEdit={() => setEditing((open) => !open)}
          onRemove={() => void onRemove(social.id)}
        />
      </div>
      {editing && (
        <div className="mt-2">
          <SocialSearchOrPaste
            pastePlaceholder="Paste the correct profile link"
            isSubmitting={isSubmitting}
            onSubmit={handleFix}
          />
        </div>
      )}
    </div>
  );
};

export default SocialRow;
