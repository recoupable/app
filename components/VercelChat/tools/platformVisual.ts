import {
  Instagram,
  Youtube,
  Music2,
  Twitter,
  Facebook,
  Globe,
  type LucideIcon,
} from "lucide-react";
import getSocialPlatformByLink from "@/lib/getSocialPlatformByLink";

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
