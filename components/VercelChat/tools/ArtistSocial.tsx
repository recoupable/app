import type { Social as SocialType } from "@/types/Social";
import Link from "next/link";
import { getSocialProfileHref } from "@/lib/socials/getSocialProfileHref";
import ArtistSocialDisplayText from "./ArtistSocialDisplayText";
import getSocialPlatformByLink from "@/lib/getSocialPlatformByLink";
import getPlatformDisplayName from "@/lib/socials/getPlatformDisplayName";

interface ArtistSocialProps {
  social: SocialType;
}

export const ArtistSocial = ({ social }: ArtistSocialProps) => {
  const platformType = getSocialPlatformByLink(social.profile_url);
  const platform =
    platformType !== "NONE"
      ? getPlatformDisplayName(platformType)
      : social.profile_url.split("/")[0].split(".")[0];

  return (
    <Link
      key={social.social_id}
      href={getSocialProfileHref(social.profile_url)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-start p-4 border rounded-xl transition-all hover:shadow-md hover:scale-[1.02] bg-card hover:bg-accent"
    >
      <span className="text-sm font-medium mb-1 text-card-foreground">
        {platform}
      </span>
      <ArtistSocialDisplayText social={social} />
    </Link>
  );
};
