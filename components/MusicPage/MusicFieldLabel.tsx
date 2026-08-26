"use client";

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface MusicFieldLabelProps {
  htmlFor: string;
  label: string;
  hint: string;
}

/**
 * A form label with the field's documentation behind an info icon, matching
 * the fal playground where every input carries one. The hints are the model's
 * own parameter descriptions, so a user can tell what a setting does without
 * leaving the page.
 */
const MusicFieldLabel = ({ htmlFor, label, hint }: MusicFieldLabelProps) => (
  <div className="flex items-center gap-1">
    <label htmlFor={htmlFor} className="text-sm font-medium">
      {label}
    </label>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`About ${label}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Info className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[280px]">{hint}</TooltipContent>
    </Tooltip>
  </div>
);

export default MusicFieldLabel;
