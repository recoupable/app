"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MessageFrameProps {
  role: "user" | "assistant";
  children: ReactNode;
  /** Edit mode stretches a user message to the column width. */
  fullWidth?: boolean;
  testId?: string;
}

/**
 * The column, gutter and role alignment every message in the thread sits in.
 *
 * Extracted from `Message` so the pre-send preview and the in-flight
 * placeholder land in exactly the position the real message will occupy —
 * the workspace-setup shell and the reasoning shell that replaces it must
 * not move when the text changes (recoupable/app#2052).
 */
const MessageFrame = ({ role, children, fullWidth = false, testId }: MessageFrameProps) => (
  <AnimatePresence>
    <motion.div
      data-testid={testId ?? `message-${role}`}
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={role}
    >
      <div
        className={cn(
          "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
          {
            "w-full": fullWidth,
            "group-data-[role=user]/message:w-fit": !fullWidth,
          },
        )}
      >
        {children}
      </div>
    </motion.div>
  </AnimatePresence>
);

export default MessageFrame;
