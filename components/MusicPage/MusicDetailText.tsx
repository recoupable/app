"use client";

import MusicCopyButton from "./MusicCopyButton";

/**
 * A labelled block of generation text with its own copy button.
 *
 * The text is rendered in full and wraps: the card truncates a prompt to one
 * line, and seeing the whole of it is the reason this dialog exists. Long
 * lyrics scroll within the block rather than pushing the settings off screen.
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
      <MusicCopyButton label={label.toLowerCase()} text={text} />
    </div>
    <p
      data-testid={testId}
      className="text-sm whitespace-pre-wrap break-words max-h-48 overflow-y-auto rounded-lg bg-muted/40 p-3"
    >
      {text}
    </p>
  </section>
);

export default MusicDetailText;
