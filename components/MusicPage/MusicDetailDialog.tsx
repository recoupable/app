"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MusicDetailText from "./MusicDetailText";
import MusicDetailSettings from "./MusicDetailSettings";
import MusicStatusPill from "./MusicStatusPill";
import useMusicGeneration from "@/hooks/useMusicGeneration";
import type { MusicGeneration } from "@/types/Music";

/**
 * The full record of one song: the whole prompt and lyrics, both copyable, and
 * the settings it ran with.
 *
 * Opens populated from the card's summary rather than waiting on the network.
 * The detail read exists only to add the seed, which the API fetches from fal,
 * so blocking the whole dialog on it would trade an instant open for one field.
 */
const MusicDetailDialog = ({
  generation,
  open,
  onOpenChange,
}: {
  generation: MusicGeneration;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { data } = useMusicGeneration(generation.id, open);
  const detail = data?.generation;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 pr-6">
            <DialogTitle className="text-base text-left">Song details</DialogTitle>
            <MusicStatusPill status={generation.status} />
          </div>
          {/* Radix requires a description for the dialog to be announced
              properly; the generation date is the useful thing to put there. */}
          <DialogDescription className="text-left">
            Generated {new Date(generation.created_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <MusicDetailText
            label="Prompt"
            text={generation.prompt}
            testId="music-detail-prompt"
          />

          <MusicDetailText
            label="Lyrics"
            text={generation.lyrics}
            testId="music-detail-lyrics"
          />

          <MusicDetailSettings generation={generation} seed={detail?.seed ?? null} />

          {generation.status === "failed" && generation.error_message && (
            <p className="text-xs text-destructive">{generation.error_message}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MusicDetailDialog;
