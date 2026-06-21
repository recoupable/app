"use client";

import { Users } from "lucide-react";
import { ToolCardSkeleton } from "./shared/ToolCardSkeleton";

const GetArtistSocialsSkeleton = ({ title }: { title?: string }) => {
  return (
    <ToolCardSkeleton
      icon={Users}
      label={title ?? "Getting artist socials…"}
      rows={4}
      className="max-w-xl"
    />
  );
};

export default GetArtistSocialsSkeleton;
