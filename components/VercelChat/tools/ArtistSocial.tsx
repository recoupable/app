import { Social as SocialType } from "@/types/Social";
import Link from "next/link";
import {
  Instagram,
  Youtube,
  Music2,
  Twitter,
  Facebook,
  Globe,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import ArtistSocialDisplayText from "./ArtistSocialDisplayText";
import getSocialPlatformByLink from "@/lib/getSocialPlatformByLink";
import getPlatformDisplayName from "@/lib/socials/getPlatformDisplayName";
import { cn } from "@/lib/utils";

const PLATFORM_ICONS: Record<string, LucideIcon> = {
  INSTAGRAM: Instagram,
  YOUTUBE: Youtube,
  SPOTIFY: Music2,
  TIKTOK: Music2,
  TWITTER: Twitter,
  FACEBOOK: Facebook,
  THREADS: Twitter,
  APPLE: Music2,
};

/**
 * Per-platform brand-color accent for the icon chip (low-opacity tint, matching
 * the tonal-chip pattern). Exported so adjacent cards (e.g. the socials update
 * confirmation) can reuse one visual language for a social link.
 */
export const PLATFORM_CHIP_STYLES: Record<string, string> = {
  INSTAGRAM: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  YOUTUBE: "bg-red-500/10 text-red-600 dark:text-red-400",
  SPOTIFY: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  TIKTOK: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  TWITTER: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  FACEBOOK: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  THREADS: "bg-foreground/10 text-foreground/80",
  APPLE: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const NEUTRAL_CHIP = "bg-muted text-foreground/70";

/** Resolve the brand icon + tinted chip classes for a social profile URL. */
export function getPlatformVisual(profileUrl: string): {
  Icon: LucideIcon;
  chipClass: string;
} {
  const platformType = getSocialPlatformByLink(profileUrl);
  return {
    Icon: PLATFORM_ICONS[platformType] ?? Globe,
    chipClass: PLATFORM_CHIP_STYLES[platformType] ?? NEUTRAL_CHIP,
  };
}

/** Compact follower-count formatter (1.2K / 3.4M). */
function formatCount(value: number): string {
  // Round up to "M" near the boundary so e.g. 999_950 renders "1M" not "1000.0K".
  if (value >= 999_950)
    return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  if (value >= 1_000)
    return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  return `${value}`;
}

/** Ensure the profile URL has a protocol before using it as an href. */
function toSocialHref(profileUrl: string): string {
  if (profileUrl.startsWith("http://") || profileUrl.startsWith("https://"))
    return profileUrl;
  return `https://${profileUrl}`;
}

export const ArtistSocial = ({ social }: { social: SocialType }) => {
  const platformType = getSocialPlatformByLink(social.profile_url);
  const platform =
    platformType !== "NONE"
      ? getPlatformDisplayName(platformType)
      : social.profile_url.split("/")[0].split(".")[0];

  const { Icon, chipClass } = getPlatformVisual(social.profile_url);
  const followers =
    typeof social.follower_count === "number" && social.follower_count > 0
      ? formatCount(social.follower_count)
      : null;

  return (
    <Link
      key={social.id}
      href={toSocialHref(social.profile_url)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group/social flex flex-col gap-2 rounded-xl border border-border bg-card p-3",
        "transition-all hover:-translate-y-0.5 hover:border-border hover:bg-muted/60 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors",
            chipClass,
          )}
        >
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-card-foreground">
          {platform}
        </span>
        <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/social:opacity-100" />
      </div>

      <ArtistSocialDisplayText social={social} />

      {/* Reserve the follower line for an even baseline grid even when absent. */}
      <span className="text-xs font-medium text-muted-foreground">
        {followers ? `${followers} followers` : "—"}
      </span>
    </Link>
  );
};
