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
  APPPLE: Music2,
};

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

  const Icon = PLATFORM_ICONS[platformType] ?? Globe;
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
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/70">
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-card-foreground">
          {platform}
        </span>
        <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/social:opacity-100" />
      </div>

      <ArtistSocialDisplayText social={social} />

      {followers ? (
        <span className="text-xs font-medium text-muted-foreground">
          {followers} followers
        </span>
      ) : null}
    </Link>
  );
};
