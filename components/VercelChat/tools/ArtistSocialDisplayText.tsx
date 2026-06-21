import { getYoutubeChannelNameFromURL } from "@/lib/youtube/getYoutubeChannelNameFromURL";
import { Social as SocialType } from "@/types/Social";
import getSocialPlatformByLink from "@/lib/getSocialPlatformByLink";

const ArtistSocialDisplayText = ({ social }: { social: SocialType }) => {
  const platformType = getSocialPlatformByLink(social.profile_url);
  const isYoutube = platformType === "YOUTUBE";
  const isSpotify = platformType === "SPOTIFY";

  // For Spotify, we don't have a display-friendly username (only the ID), so skip username display
  const hasUsername = Boolean(
    social.username && social.username.length > 0 && !isYoutube && !isSpotify,
  );

  const username =
    hasUsername && social.username
      ? social.username.startsWith("@")
        ? social.username
        : `@${social.username}`
      : "";

  const youtubeChannelName = isYoutube
    ? getYoutubeChannelNameFromURL(social.profile_url)
    : "";

  const display = hasUsername
    ? username
    : isYoutube && youtubeChannelName
      ? youtubeChannelName
      : social.profile_url;

  return (
    <span className="block max-w-full truncate text-xs text-muted-foreground">
      {display}
    </span>
  );
};

export default ArtistSocialDisplayText;
