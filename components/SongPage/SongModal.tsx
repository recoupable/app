"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import SongDetail from "./SongDetail";

/**
 * The intercepted song route, shown over the gallery.
 *
 * Closing goes back rather than flipping local state: the URL is the source of
 * truth here, so setting `open` to false would hide the dialog while leaving
 * the address bar on the song, and the two would drift.
 */
const SongModal = ({ generationId }: { generationId: string }) => {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={open => !open && router.back()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        {/* The dialog owns the title and SongDetail omits its page heading.
            Rendering both meant two "Song details" headings, announced twice
            by a screen reader. */}
        <DialogTitle className="font-heading text-xl font-bold text-left">
          Song details
        </DialogTitle>
        <SongDetail generationId={generationId} inDialog />
      </DialogContent>
    </Dialog>
  );
};

export default SongModal;
