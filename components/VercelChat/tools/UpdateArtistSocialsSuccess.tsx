import { useArtistProvider } from "@/providers/ArtistProvider";
import ArtistHeroSection from "./ArtistHeroSection";
import { ArtistProfile } from "@/lib/supabase/artist/updateArtistProfile";
import { AccountSocialWithSocial } from "@/lib/supabase/account_socials/getAccountSocials";
import Link from "next/link";
import { ExternalLink, Globe, Share2 } from "lucide-react";
import getSocialPlatformByLink from "@/lib/getSocialPlatformByLink";
import getPlatformDisplayName from "@/lib/socials/getPlatformDisplayName";
import { useEffect } from "react";
import { ToolCard } from "./shared/ToolCard";
import { ToolCardRow } from "./shared/ToolCard";
import ToolEmpty from "./shared/ToolEmpty";

export interface UpdateArtistSocialsResult {
  success: boolean;
  message: string;
  socials?: AccountSocialWithSocial[];
}

export interface UpdateArtistSocialsSuccessProps {
  result: UpdateArtistSocialsResult;
}

const normalizeUrl = (url: string) =>
  url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;

const UpdateArtistSocialsSuccess: React.FC<UpdateArtistSocialsSuccessProps> = ({
  result,
}) => {
  const { getArtists, selectedArtist } = useArtistProvider();

  useEffect(() => {
    getArtists();
  }, []);

  const socials = result.socials ?? [];
  const hasSocials = socials.length > 0;

  return (
    <ToolCard
      icon={Share2}
      tone="success"
      title="Artist socials updated"
      subtitle={result.message || "Artist socials updated successfully."}
      trailing={
        hasSocials ? (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {socials.length}
          </span>
        ) : undefined
      }
      className="max-w-xl"
    >
      {selectedArtist ? (
        <ArtistHeroSection
          artistProfile={selectedArtist as ArtistProfile}
          message={result.message || "Artist socials updated successfully."}
        />
      ) : null}

      {hasSocials ? (
        <div className="space-y-1 border-t border-border/60 p-2">
          {socials.map((social) => {
            const platformType = getSocialPlatformByLink(
              social.social.profile_url,
            );
            const platform =
              platformType !== "NONE"
                ? getPlatformDisplayName(platformType)
                : "Social link";

            return (
              <Link
                href={normalizeUrl(social.social.profile_url)}
                key={social.social.id}
                target="_blank"
                rel="noopener noreferrer"
                passHref
              >
                <ToolCardRow className="group/row cursor-pointer">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/70">
                    <Globe className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      {social.social.profile_url}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {platform}
                    </div>
                  </div>
                  <ExternalLink className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100" />
                </ToolCardRow>
              </Link>
            );
          })}
        </div>
      ) : (
        <ToolEmpty
          icon={Share2}
          title="No socials linked"
          description="No social profiles were attached to this update."
        />
      )}
    </ToolCard>
  );
};

export default UpdateArtistSocialsSuccess;
