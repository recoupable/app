"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ArtistSocialsVerification } from "@/lib/onboarding/socialVerificationTypes";
import type { ArtistRecord } from "@/types/Artist";
import SocialFixForm from "./SocialFixForm";
import SocialVerifyRow from "./SocialVerifyRow";

interface ArtistSocialsCardProps {
  artist: ArtistRecord;
  verification: ArtistSocialsVerification | undefined;
  isResolved: boolean;
  isFixing: boolean;
  onConfirm: (socialId: string) => void;
  onReject: (socialId: string) => void;
  onMarkNone: () => void;
  onFix: (url: string) => Promise<boolean>;
}

/** Per-artist socials verification: confirm-or-fix each match, or record "none". */
const ArtistSocialsCard = ({
  artist,
  verification,
  isResolved,
  isFixing,
  onConfirm,
  onReject,
  onMarkNone,
  onFix,
}: ArtistSocialsCardProps) => {
  const socials = artist.account_socials ?? [];
  const hasRejection = Object.values(verification?.verdicts ?? {}).includes(
    "rejected",
  );
  const showFixForm = hasRejection || socials.length === 0;

  return (
    <div className="p-4 rounded-xl border border-border bg-card flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-medium text-card-foreground truncate">
          {artist.name || "Untitled artist"}
        </h2>
        {isResolved && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle2 className="size-4 text-[#22c55e]" />
            {verification?.none ? "No socials" : "Verified"}
          </span>
        )}
      </div>

      {socials.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No socials were auto-matched for this artist.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {socials.map((social) => (
            <SocialVerifyRow
              key={social.id}
              social={social}
              verdict={verification?.verdicts[social.id]}
              onConfirm={() => onConfirm(social.id)}
              onReject={() => onReject(social.id)}
            />
          ))}
        </div>
      )}

      {showFixForm && (
        <SocialFixForm
          placeholder="Paste the correct profile link"
          isSubmitting={isFixing}
          onSubmit={onFix}
        />
      )}

      {!verification?.none && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start text-muted-foreground"
          onClick={onMarkNone}
        >
          This artist has no socials
        </Button>
      )}
    </div>
  );
};

export default ArtistSocialsCard;
