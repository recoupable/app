"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialRowActionsProps {
  platform: string;
  editing: boolean;
  isSubmitting: boolean;
  onToggleEdit: () => void;
  onRemove: () => void;
}

/**
 * The per-social action cluster on a verify-socials row: Edit (toggles the
 * paste-the-correct-link form) and Remove (chat#1889 — the step previously
 * only added or replaced, so an unwanted profile could not be taken back).
 * Own file so SocialRow is extended by composition, not edited per action.
 */
const SocialRowActions = ({
  platform,
  editing,
  isSubmitting,
  onToggleEdit,
  onRemove,
}: SocialRowActionsProps) => (
  <div className="flex shrink-0 items-center">
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="text-muted-foreground"
      aria-label={`Edit ${platform} link`}
      aria-expanded={editing}
      onClick={onToggleEdit}
    >
      <Pencil className="size-4" />
    </Button>
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="text-muted-foreground"
      aria-label={`Remove ${platform} link`}
      disabled={isSubmitting}
      onClick={onRemove}
    >
      <Trash2 className="size-4" />
    </Button>
  </div>
);

export default SocialRowActions;
