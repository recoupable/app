import { useArtistProvider } from "@/providers/ArtistProvider";
import ArtistHeroSection from "./ArtistHeroSection";
import { ArtistProfile } from "@/lib/supabase/artist/updateArtistProfile";
import { AccountSocialWithSocial } from "@/lib/supabase/account_socials/getAccountSocials";
import Link from "next/link";
import { getSocialProfileHref } from "@/lib/socials/getSocialProfileHref";
import { ExternalLink, Globe } from "lucide-react";
import getSocialPlatformByLink from "@/lib/getSocialPlatformByLink";
import { useEffect } from "react";

export interface UpdateArtistSocialsResult {
  success: boolean;
  message: string;
  socials?: AccountSocialWithSocial[];
}

export interface UpdateArtistSocialsSuccessProps {
  result: UpdateArtistSocialsResult;
}

const UpdateArtistSocialsSuccess: React.FC<UpdateArtistSocialsSuccessProps> = ({
  result,
}) => {
  const { getArtists } = useArtistProvider();
  const { selectedArtist } = useArtistProvider();

  useEffect(() => {
    getArtists();
  }, []);

  const message =
    result.message ||
    (result.success
      ? "Artist socials updated successfully."
      : "Failed to update artist socials.");

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl overflow-hidden max-w-2xl w-full my-4">
      {result.success && selectedArtist ? (
        <ArtistHeroSection
          artistProfile={selectedArtist as ArtistProfile}
          message={message}
        />
      ) : (
        <p className="p-6 sm:p-8 text-sm text-white break-words">{message}</p>
      )}
      <div className="bg-black/40 backdrop-blur-sm rounded-b-xl overflow-hidden">
        <div className="p-4 sm:p-6 space-y-2">
          {result.socials?.map((social) => (
            <Link
              href={getSocialProfileHref(social.social.profile_url)}
              key={social.social.id}
              target="_blank"
              rel="noopener noreferrer"
              passHref
            >
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-accent transition-colors group cursor-pointer">
                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">
                    {social.social.profile_url}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getSocialPlatformByLink(
                      social.social.profile_url,
                    ).toLowerCase() || "Social Link"}
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpdateArtistSocialsSuccess;
