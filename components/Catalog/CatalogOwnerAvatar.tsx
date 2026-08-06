"use client";

import { Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CatalogOwner } from "@/types/Catalog";

interface CatalogOwnerAvatarProps {
  owner: CatalogOwner;
}

/**
 * Whose catalog this is, in one glyph: the owner's avatar, or their initial —
 * with the organization icon when the catalog belongs to an org rather than to
 * the viewer. Some accounts have no image at all (the Recoup organization's is
 * null), so the fallback is the normal path, not an edge case.
 */
const CatalogOwnerAvatar = ({ owner }: CatalogOwnerAvatarProps) => {
  const name = owner.name?.trim();
  const label = owner.is_organization
    ? `Owned by ${name || "an organization"} (organization)`
    : `Owned by ${name || "this account"}`;

  return (
    <Avatar
      className="h-6 w-6 shadow-[0_0_0_1px_var(--border)]"
      aria-label={label}
      title={label}
    >
      {owner.image ? <AvatarImage src={owner.image} alt="" /> : null}
      <AvatarFallback className="text-[10px] font-medium bg-muted text-muted-foreground">
        {owner.is_organization && !name ? (
          <Building2 className="h-3 w-3" aria-hidden="true" />
        ) : (
          (name?.[0] ?? "?").toUpperCase()
        )}
      </AvatarFallback>
    </Avatar>
  );
};

export default CatalogOwnerAvatar;
