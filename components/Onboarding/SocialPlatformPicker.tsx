"use client";

import { Button } from "@/components/ui/button";
import { getConnectorIcon } from "@/lib/composio/getConnectorIcon";
import { getSocialPlatformOptions } from "@/lib/onboarding/getSocialPlatformOptions";
import type { SocialPlatformOption } from "@/lib/onboarding/getSocialPlatformOptions";

/**
 * Which platform am I adding? (chat#1889) Verify-socials previously jumped
 * straight to a Spotify search, so an artist missing their Instagram had no
 * obvious path. Branded icons come from the existing connector-icon helper.
 */
const SocialPlatformPicker = ({
  onSelect,
  disabled,
}: {
  onSelect: (option: SocialPlatformOption) => void;
  disabled?: boolean;
}) => (
  <div className="flex flex-col gap-2">
    <p className="text-xs text-muted-foreground">Which platform?</p>
    <div className="flex flex-wrap gap-2">
      {getSocialPlatformOptions().map((option) => (
        <Button
          key={option.slug}
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="gap-2"
          onClick={() => onSelect(option)}
        >
          {getConnectorIcon(option.slug, 16)}
          {option.label}
        </Button>
      ))}
    </div>
  </div>
);

export default SocialPlatformPicker;
