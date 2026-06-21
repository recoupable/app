import { Mic2, Share2 } from "lucide-react";
import { SpotifyDeepResearchResultUIType } from "@/types/spotify";
import { ArtistSocial } from "./ArtistSocial";
import { ToolCard, ToolCardBody } from "./shared/ToolCard";
import ToolError from "./shared/ToolError";
import ToolEmpty from "./shared/ToolEmpty";

export default function SpotifyDeepResearchResult({
  result,
}: {
  result: SpotifyDeepResearchResultUIType;
}) {
  const socials = result.artistSocials?.socials ?? [];

  if (!result.success) {
    return (
      <ToolError
        title="Spotify deep research"
        message="Spotify deep research failed to complete. You can try again."
      />
    );
  }

  return (
    <ToolCard
      icon={Mic2}
      tone="success"
      title="Spotify deep research"
      subtitle={
        socials.length > 0
          ? `${socials.length} platform${socials.length === 1 ? "" : "s"} found`
          : "Research complete"
      }
    >
      <ToolCardBody>
        {socials.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {socials.map((social) => (
              <ArtistSocial key={social.id} social={social} />
            ))}
          </div>
        ) : (
          <ToolEmpty
            icon={Share2}
            title="No socials found"
            description="We couldn't find linked social profiles for this artist."
          />
        )}
      </ToolCardBody>
    </ToolCard>
  );
}
