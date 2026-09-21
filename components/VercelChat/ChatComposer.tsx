"use client";

import type { FormEventHandler, ReactNode } from "react";
import type { ChatStatus } from "ai";
import {
  PromptInput,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import FileMentionsInput from "./FileMentionsInput";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  disabled?: boolean;
  sendDisabled: boolean;
  status: ChatStatus;
  submitLabel?: string;
  placeholder?: string;
  ariaLabel?: string;
  mentionsEnabled?: boolean;
  tools: ReactNode;
  attachments?: ReactNode;
}

export default function ChatComposer({
  value,
  onChange,
  onSubmit,
  disabled = false,
  sendDisabled,
  status,
  submitLabel = "Send message",
  placeholder,
  ariaLabel,
  mentionsEnabled = true,
  tools,
  attachments,
}: ChatComposerProps) {
  return (
    <PromptInput
      onSubmit={onSubmit}
      aria-busy={status === "submitted" || status === "streaming"}
      className="overflow-visible rounded-2xl border-0 bg-card shadow-[0_0_0_1px_var(--input),0_6px_24px_var(--surface-shadow)] focus-within:ring-1 focus-within:ring-foreground/30"
    >
      {attachments}
      <FileMentionsInput
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        ariaLabel={ariaLabel}
        mentionsEnabled={mentionsEnabled}
      />
      <PromptInputToolbar className="px-3 py-2">
        <PromptInputTools>{tools}</PromptInputTools>
        <PromptInputSubmit
          aria-label={submitLabel}
          disabled={sendDisabled}
          status={status}
          className="size-10 rounded-xl bg-brand-lime text-brand-on-lime hover:bg-brand-lime-hover transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </PromptInputToolbar>
    </PromptInput>
  );
}
