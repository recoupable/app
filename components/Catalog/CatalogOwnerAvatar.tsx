"use client";

import { Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CatalogOwner } from "@/types/Catalog";

export interface CatalogOwnerAvatarProps {
  owner: CatalogOwner;
}

/**
 * Whose catalog this is, in one glyph: the owner's avatar, or — when they have
 * none — the organization icon for an organization and the person's initial for
 * an account. Some accounts genuinely have no image (the Recoup organization's
 * is null), so the fallback is the normal path, not an edge case.
 *
 * `role="img"` carries the accessible name: the Radix avatar root renders a
 * plain `span`, and HTML-AAM ignores `aria-label` on a role-less element — the
 * personal-vs-organization distinction would exist only for people who can see
 * the picture.
 */
const CatalogOwnerAvatar = ({ owner }: CatalogOwnerAvatarProps) => {
  const name = owner.name?.trim();
  const label = owner.is_organization
    ? `Owned by ${name || "an organization"} (organization)`
    : `Owned by ${name || "this account"}`;
  // Code points, not UTF-16 units: a name starting with an emoji would
  // otherwise render half a surrogate pair.
  const initial = (Array.from(name ?? "")[0] ?? "?").toUpperCase();

  return (
    <Avatar
      className="h-6 w-6 shadow-[0_0_0_1px_var(--border)]"
      role="img"
      aria-label={label}
      title={label}
    >
      {owner.image ? <AvatarImage src={owner.image} alt="" /> : null}
      <AvatarFallback className="text-[10px] font-medium bg-muted text-muted-foreground">
        {owner.is_organization ? (
          <Building2 className="h-3 w-3" aria-hidden="true" />
        ) : (
          initial
        )}
      </AvatarFallback>
    </Avatar>
  );
};

export default CatalogOwnerAvatar;
