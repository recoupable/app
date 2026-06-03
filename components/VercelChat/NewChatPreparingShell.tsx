"use client";

import cn from "classnames";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import ChatGreeting from "@/components/Chat/ChatGreeting";
import FileMentionsInput from "./FileMentionsInput";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputToolbar,
} from "../ai-elements/prompt-input";

interface NewChatPreparingShellProps {
  input: string;
  onInputChange: (value: string) => void;
}

/**
 * Empty new-chat layout shown while session + sandbox provision. Users
 * can type immediately; Send stays disabled until bootstrap completes.
 */
export default function NewChatPreparingShell({
  input,
  onInputChange,
}: NewChatPreparingShellProps) {
  return (
    <div className="px-4 md:px-0 pb-4 flex flex-col h-full items-center w-full relative">
      <div className="absolute w-full h-6 bg-gradient-to-t from-transparent via-background/80 to-background z-10 top-0" />
      <div className="flex-1" />
      <div className="w-full max-w-3xl mx-auto">
        <ChatGreeting isVisible />
        <div className="mt-1 md:mt-6 relative px-4">
          <motion.div
            className="w-full relative"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <PromptInput
              onSubmit={(event) => event.preventDefault()}
              className={cn(
                "overflow-visible",
                "rounded-2xl border border-border bg-background/70 backdrop-blur",
                "shadow-sm",
              )}
            >
              <FileMentionsInput
                value={input}
                onChange={onInputChange}
                disabled={false}
              />
              <PromptInputToolbar className="justify-end gap-2">
                <span
                  aria-live="polite"
                  className="text-xs text-muted-foreground"
                >
                  Preparing…
                </span>
                <PromptInputSubmit
                  disabled
                  aria-label="Preparing chat"
                  className="cursor-not-allowed opacity-50 rounded-full"
                >
                  <Loader2 className="size-4 animate-spin" />
                </PromptInputSubmit>
              </PromptInputToolbar>
            </PromptInput>
          </motion.div>
        </div>
      </div>
      <div className="flex-1" />
    </div>
  );
}
