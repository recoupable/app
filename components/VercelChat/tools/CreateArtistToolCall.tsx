import React from "react";
import { Sparkles } from "lucide-react";
import ToolCardSkeleton from "./shared/ToolCardSkeleton";

/**
 * Component that displays when the create_new_artist tool is being called.
 * Mirrors the resolved CreateArtist success card so there's no layout jump.
 */
export function CreateArtistToolCall() {
  return (
    <ToolCardSkeleton
      icon={Sparkles}
      label="Creating new artist…"
      rows={0}
      className="max-w-sm"
    />
  );
}

export default CreateArtistToolCall;
