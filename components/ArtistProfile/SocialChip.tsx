import SocialIcon from "./SocialIcon";
import { ensureAbsoluteUrl } from "@/lib/urls/ensureAbsoluteUrl";
import type { ArtistProfileSocial } from "@/lib/recoup/getArtistProfile";

/** Brand-correct display names where naive capitalization gets them wrong. */
const BRAND_LABELS: Record<string, string> = {
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
  SOUNDCLOUD: "SoundCloud",
  X: "X",
};

const label = (type: string) =>
  BRAND_LABELS[type.toUpperCase()] ??
  type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

/**
 * One connected social profile as an outbound pill link — platform icon,
 * platform name, and the artist's handle when known.
 */
const SocialChip = ({ social }: { social: ArtistProfileSocial }) => (
  <a
    href={ensureAbsoluteUrl(social.profile_url)}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium text-foreground shadow-[0px_0px_0px_1px_var(--border)] transition-colors hover:bg-muted"
  >
    <SocialIcon type={social.type} />
    <span>{label(social.type)}</span>
    {social.username && (
      <span className="text-muted-foreground">{social.username}</span>
    )}
  </a>
);

export default SocialChip;
