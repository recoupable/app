import { SocialsResponse } from "@/types/Social";
import { Share2, Users } from "lucide-react";
import { ReactNode } from "react";
import { ArtistSocial } from "./ArtistSocial";
import { ToolCard, ToolCardBody } from "./shared/ToolCard";
import { ToolEmpty } from "./shared/ToolEmpty";
import { ToolError } from "./shared/ToolError";

export default function GetArtistSocialsResult({
  result,
  errorText,
  icon,
  title,
}: {
  result: SocialsResponse;
  errorText?: string;
  icon?: ReactNode;
  title?: string;
}) {
  if (result.status !== "success") {
    return (
      <ToolError
        title="Artist socials"
        message={errorText ?? "We couldn't load this artist's social profiles."}
      />
    );
  }

  const socials = result.socials ?? [];
  const hasSocials = socials.length > 0;

  return (
    <ToolCard
      icon={icon ? undefined : Users}
      media={
        icon ? (
          <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-foreground/70">
            {icon}
          </div>
        ) : undefined
      }
      tone="accent"
      title={title ?? "Artist socials"}
      subtitle={
        hasSocials
          ? `${socials.length} ${socials.length === 1 ? "platform" : "platforms"} connected`
          : "No platforms connected"
      }
      trailing={
        hasSocials ? (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {socials.length}
          </span>
        ) : undefined
      }
    >
      {hasSocials ? (
        <ToolCardBody>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {socials.map((social) => (
              <ArtistSocial key={social.id} social={social} />
            ))}
          </div>
        </ToolCardBody>
      ) : (
        <ToolEmpty
          icon={Share2}
          title="No socials found"
          description="We couldn't find any linked social profiles for this artist."
        />
      )}
    </ToolCard>
  );
}
