"use client";

import { Check, Copy } from "lucide-react";
import { useCopy } from "@/hooks/useCopy";

/**
 * Copies a block of generation text, with the label naming what it copies so
 * the two buttons in the detail dialog stay distinguishable to a screen reader.
 */
const MusicCopyButton = ({ label, text }: { label: string; text: string }) => {
  const { copied, copy } = useCopy();

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      aria-label={`Copy ${label}`}
      className="shrink-0 inline-flex items-center justify-center size-7 rounded-lg border hover:bg-muted transition-colors"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
};

export default MusicCopyButton;
