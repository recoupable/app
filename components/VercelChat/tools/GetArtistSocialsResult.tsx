import { SocialsResponse } from "@/types/Social";
import { Music } from "lucide-react";
import { ReactNode } from "react";
import { ArtistSocial } from "./ArtistSocial";

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
      <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
        <span>{errorText ?? "Artist socials failed"}</span>
      </div>
    );
  }

  const hasSocials = result.socials.length > 0;
  const socials = hasSocials ? result.socials : [];

  return (
    <div className="flex flex-col gap-4 p-5 border rounded-xl bg-background shadow-sm">
      <div className="flex items-center gap-2 text-primary border-b pb-3">
        {icon ?? <Music />}
        <h3 className="font-semibold text-foreground">
          {title ?? "Artist Socials Found"}
        </h3>
      </div>

      {hasSocials && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground dark:text-muted-foreground">
              Artist Socials
            </h4>
            <span className="text-xs text-muted-foreground">
              {socials.length} {socials.length === 1 ? "platform" : "platforms"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {socials.map((social) => (
              <ArtistSocial key={social.id} social={social} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
