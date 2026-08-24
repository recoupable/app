"use client";

import CopyButton from "@/components/CopyButton";

/**
 * A labelled block of generation text with its own copy button.
 *
 * The text is rendered in full and wraps: the card truncates a prompt to one
 * line, and seeing the whole of it is the reason this dialog exists.
 *
 * No inner scroll box. Capping the height put a second scroll context inside
 * an already-scrollable dialog, which hid most of a long lyric behind a
 * scrollbar that is easy to miss. The dialog scrolls instead, so the whole
 * lyric is reachable by scrolling the thing the user is already scrolling.
 */
const MusicDetailText = ({
  label,
  text,
  testId,
}: {
  label: string;
  text: string;
  testId: string;
}) => (
  <section>
    <div className="flex items-center justify-between gap-2 mb-1.5">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </h3>
      <CopyButton label={label.toLowerCase()} text={text} className="size-7 shrink-0" />
    </div>
    <p
      data-testid={testId}
      className="text-sm whitespace-pre-wrap break-words rounded-lg bg-muted/40 p-3"
    >
      {text}
    </p>
  </section>
);

export default MusicDetailText;
