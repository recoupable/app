"use client";

import Image from "next/image";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import type { AgentTemplateCreator } from "@/types/AgentTemplates";

interface AgentCreatorProps {
  creator: AgentTemplateCreator | null;
  className?: string;
}

const AgentCreator = ({ creator, className }: AgentCreatorProps) => {
  const isAdmin = !!creator?.is_admin;
  const imageUrl = creator?.image || "";
  const name = creator?.name || "";

  if (!creator || isAdmin) {
    return (
      <div className={className}>
        <Image
          src="/brand-logos/recoup-v2.png"
          alt="Recoup"
          width={18}
          height={18}
          className="w-auto rounded-full"
          priority={false}
        />
      </div>
    );
  }

  if (!imageUrl) return null;

  return (
    <div className={className}>
      <Avatar className="h-[24px] w-[24px] rounded-full">
        <AvatarImage src={imageUrl} alt={name || "Creator"} />
      </Avatar>
    </div>
  );
};

export default AgentCreator;
