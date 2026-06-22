"use client";

import { useArtistProvider } from "@/providers/ArtistProvider";
import ArtistHeroSection from "./ArtistHeroSection";
import { ArtistProfile } from "@/lib/supabase/artist/updateArtistProfile";
import { AccountSocialWithSocial } from "@/lib/supabase/account_socials/getAccountSocials";
import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, Share2 } from "lucide-react";
import getSocialPlatformByLink from "@/lib/getSocialPlatformByLink";
import getPlatformDisplayName from "@/lib/socials/getPlatformDisplayName";
import { useEffect } from "react";
import { ToolCard } from "./shared/ToolCard";
import { ToolCardRow } from "./shared/ToolCard";
import { ToolEmpty } from "./shared/ToolEmpty";
import { getPlatformVisual } from "./getPlatformVisual";
import { cn } from "@/lib/utils";

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
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
            {socials.length}
          </span>
        ) : undefined
      }
      className="max-w-xl"
    >
      {/* The ToolCard header owns the success confirmation; the hero shows
          identity only (no `message`) so the check/message isn't doubled. */}
      {selectedArtist ? (
        <ArtistHeroSection artistProfile={selectedArtist as ArtistProfile} />
      ) : null}

      {hasSocials ? (
        <motion.div
          className="space-y-1 border-t border-border/60 p-2"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {socials.map((social) => {
            const platformType = getSocialPlatformByLink(
              social.social.profile_url,
            );
            const platform =
              platformType !== "NONE"
                ? getPlatformDisplayName(platformType)
                : "Social link";
            const { Icon, chipClass } = getPlatformVisual(
              social.social.profile_url,
            );

            return (
              <motion.div
                key={social.social.id}
                variants={{
                  hidden: { opacity: 0, y: 4 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={normalizeUrl(social.social.profile_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  passHref
                >
                  <ToolCardRow className="group/row cursor-pointer">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                        chipClass,
                      )}
                    >
                      <Icon className="size-4" strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">
                        {platform}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {social.social.profile_url}
                      </div>
                    </div>
                    <ExternalLink className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100" />
                  </ToolCardRow>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
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
