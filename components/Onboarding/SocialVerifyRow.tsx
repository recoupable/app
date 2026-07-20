"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import getSocialPlatformByLink from "@/lib/getSocialPlatformByLink";
import { getSocialFollowerCount } from "@/lib/onboarding/getSocialFollowerCount";
import getPlatformDisplayName from "@/lib/socials/getPlatformDisplayName";
import formatFollowerCount from "@/lib/utils/formatFollowerCount";
import type { SocialVerdict } from "@/lib/onboarding/socialVerificationTypes";
import type { SOCIAL } from "@/types/Agent";

interface SocialVerifyRowProps {
  social: SOCIAL;
  verdict: SocialVerdict | undefined;
  onConfirm: () => void;
  onReject: () => void;
}

/** One auto-matched social: platform, handle, followers, confirm-or-reject. */
const SocialVerifyRow = ({
  social,
  verdict,
  onConfirm,
  onReject,
}: SocialVerifyRowProps) => {
  const platform = getPlatformDisplayName(
    getSocialPlatformByLink(social.link || ""),
  );
  const followerCount = getSocialFollowerCount(social);
  const handle = social.username
    ? social.username.startsWith("@")
      ? social.username
      : `@${social.username}`
    : social.link;

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-card-foreground">{platform}</p>
        <p className="text-xs text-muted-foreground truncate">
          {handle}
          {followerCount !== null &&
            ` · ${formatFollowerCount(followerCount)} followers`}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          size="sm"
          variant={verdict === "confirmed" ? "default" : "outline"}
          aria-pressed={verdict === "confirmed"}
          onClick={onConfirm}
        >
          <Check className="size-4 mr-1" />
          Correct
        </Button>
        <Button
          type="button"
          size="sm"
          variant={verdict === "rejected" ? "destructive" : "outline"}
          aria-pressed={verdict === "rejected"}
          onClick={onReject}
        >
          <X className="size-4 mr-1" />
          Wrong
        </Button>
      </div>
    </div>
  );
};

export default SocialVerifyRow;
