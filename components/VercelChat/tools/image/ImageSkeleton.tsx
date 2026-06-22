"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon, Wand2 } from "lucide-react";
import { toolCardMotion } from "../shared/toolCardTokens";

export function ImageSkeleton() {
  return (
    <motion.div
      initial={toolCardMotion.initial}
      animate={toolCardMotion.animate}
      transition={toolCardMotion.transition}
      className="my-3 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <Wand2 className="size-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            Generating image…
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            This usually takes a few seconds
          </p>
        </div>
      </div>
      <div className="relative aspect-square w-full overflow-hidden border-t border-border/60 bg-muted">
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/60 to-muted" />
        {/* Diagonal "developing photo" shimmer sweep */}
        <motion.div
          aria-hidden
          className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-foreground/10 to-transparent"
          initial={{ x: 0 }}
          animate={{ x: ["0%", "450%"] }}
          transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="size-12 text-muted-foreground/40" />
        </div>
      </div>
    </motion.div>
  );
}

export default ImageSkeleton;
