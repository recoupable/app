export interface SocialPlatformOption {
  /** Connector slug, for `getConnectorIcon`. */
  slug: string;
  label: string;
  /** Paste-a-link placeholder, naming the platform so the ask is unambiguous. */
  placeholder: string;
  /** True when a typeahead exists for this platform (Spotify only, today). */
  supportsSearch: boolean;
}

/**
 * Platforms a user can attach during verify-socials (chat#1889).
 *
 * `SocialFixForm` guided everyone to Spotify regardless of what was missing, so
 * an artist whose Instagram was unmatched had no obvious way to add it. Leading
 * with a platform choice makes the ask explicit; only Spotify has a search
 * endpoint, so the rest fall back to a platform-specific paste prompt.
 */
export function getSocialPlatformOptions(): SocialPlatformOption[] {
  return [
    {
      slug: "spotify",
      label: "Spotify",
      placeholder: "Paste a Spotify artist link",
      supportsSearch: true,
    },
    {
      slug: "instagram",
      label: "Instagram",
      placeholder: "Paste an Instagram profile link",
      supportsSearch: false,
    },
    {
      slug: "twitter",
      label: "X",
      placeholder: "Paste an X profile link",
      supportsSearch: false,
    },
    {
      slug: "youtube",
      label: "YouTube",
      placeholder: "Paste a YouTube channel link",
      supportsSearch: false,
    },
    {
      slug: "tiktok",
      label: "TikTok",
      placeholder: "Paste a TikTok profile link",
      supportsSearch: false,
    },
  ];
}
