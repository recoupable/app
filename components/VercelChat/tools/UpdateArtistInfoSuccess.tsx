import React, { useEffect } from "react";
import KnowledgeBaseSection from "./KnowledgeBaseSection";
import { Knowledge } from "@/types/knowledge";
import { CheckCircle2, FileText, Building2 } from "lucide-react";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { ArtistProfile } from "@/lib/supabase/artist/updateArtistProfile";
import { ToolCard, ToolCardBody } from "./shared/ToolCard";

/**
 * Result type for updateAccountInfo tool
 */
export interface UpdateAccountInfoResult {
  success: boolean;
  artistProfile?: ArtistProfile;
  message: string;
  error?: string;
}

interface UpdateArtistInfoSuccessProps {
  result: UpdateAccountInfoResult;
}

const UpdateArtistInfoSuccess: React.FC<UpdateArtistInfoSuccessProps> = ({
  result,
}) => {
  const { getArtists } = useArtistProvider();
  const { artistProfile, message } = result;

  useEffect(() => {
    getArtists();
  }, []);

  // Minimal confirmation when no profile detail is returned.
  if (!artistProfile) {
    return (
      <ToolCard
        icon={CheckCircle2}
        tone="success"
        title="Artist info updated"
        subtitle={message}
        className="max-w-sm"
      />
    );
  }

  const knowledges = Array.isArray(artistProfile.knowledges)
    ? artistProfile.knowledges.filter(
        (item): item is Knowledge =>
          Boolean(
            item &&
              typeof item === "object" &&
              "url" in item &&
              "name" in item &&
              "type" in item,
          ),
      )
    : [];

  const avatar = artistProfile.image ? (
    <div className="flex size-9 items-center justify-center overflow-hidden rounded-xl bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={artistProfile.image}
        alt={artistProfile.name || "Artist"}
        width={36}
        height={36}
        className="size-full object-cover"
      />
    </div>
  ) : undefined;

  const hasBody =
    Boolean(artistProfile.instruction) ||
    knowledges.length > 0 ||
    Boolean(artistProfile.organization);

  return (
    <ToolCard
      icon={avatar ? undefined : CheckCircle2}
      media={avatar}
      tone="success"
      title={artistProfile.name || "Artist updated"}
      subtitle={message || "Profile updated successfully"}
      className="max-w-xl"
    >
      {hasBody ? (
        <ToolCardBody className="space-y-4">
          {artistProfile.instruction && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <FileText className="size-3.5" /> Custom instructions
              </h3>
              <p className="rounded-lg bg-muted/60 p-3 text-sm leading-relaxed text-foreground">
                {artistProfile.instruction}
              </p>
            </div>
          )}

          {knowledges.length > 0 && (
            <KnowledgeBaseSection knowledges={knowledges} />
          )}

          {artistProfile.organization && (
            <div className="flex items-center gap-2 border-t border-border/60 pt-3 text-sm text-muted-foreground">
              <Building2 className="size-3.5" />
              <span className="font-medium text-foreground">Organization</span>
              <span className="truncate">{artistProfile.organization}</span>
            </div>
          )}
        </ToolCardBody>
      ) : null}
    </ToolCard>
  );
};

export default UpdateArtistInfoSuccess;
