import React, { useEffect } from "react";
import ArtistHeroSection from "./ArtistHeroSection";
import KnowledgeBaseSection from "./KnowledgeBaseSection";
import { Knowledge } from "@/types/knowledge";
import { CheckCircle, FileText } from "lucide-react";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { ArtistProfile } from "@/lib/supabase/artist/updateArtistProfile";

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

  if (!artistProfile) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl overflow-hidden max-w-2xl w-full my-4 p-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <span className="text-white font-medium">{message}</span>
        </div>
      </div>
    );
  }

  // Type guard for knowledges
  const knowledges = Array.isArray(artistProfile.knowledges)
    ? (artistProfile.knowledges as unknown as Knowledge[])
    : [];

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl overflow-hidden max-w-2xl w-full my-4">
      <ArtistHeroSection artistProfile={artistProfile} />

      <div className="bg-black/40 backdrop-blur-sm rounded-b-xl overflow-hidden">
        <div className="p-4 sm:p-6">
          {/* Custom Instructions */}
          {artistProfile.instruction && (
            <div className="mb-6">
              <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Custom Instructions
              </h3>
              <div className="bg-card/50 rounded-lg p-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {artistProfile.instruction}
                </p>
              </div>
            </div>
          )}

          {/* Knowledge base */}
          {knowledges.length > 0 && (
            <KnowledgeBaseSection knowledges={knowledges} />
          )}

          {/* Organization */}
          {artistProfile.organization && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                <span className="text-muted-foreground">Organization:</span>{" "}
                {artistProfile.organization}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateArtistInfoSuccess;
