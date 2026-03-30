interface MentionsStyleOptions {
  disableInternalScroll?: boolean;
}

export function getMentionsStyles({
  disableInternalScroll = false,
}: MentionsStyleOptions = {}) {
  const maxHeight = disableInternalScroll ? undefined : 180;
  const overflowY = disableInternalScroll ? "hidden" : "auto";

  return {
    control: {
      minHeight: 44,
      border: "none",
      outline: "none",
      background: "transparent",
      width: "100%",
    },
    "&multiLine": {
      highlighter: {
        padding: "12px 20px",
        fontSize: 14,
        lineHeight: 1.6,
        maxHeight,
        overflow: "hidden",
        color: "transparent",
        whiteSpace: "pre-wrap",
      },
      input: {
        padding: "12px 20px",
        outline: "none",
        fontSize: 14,
        lineHeight: 1.6,
        minHeight: 44,
        maxHeight,
        overflowY,
        resize: "none",
        boxSizing: "border-box" as const,
        color: "inherit",
        backgroundColor: "transparent",
      },
    },
    "&singleLine": {
      highlighter: {
        padding: "12px 20px",
        fontSize: 14,
        lineHeight: 1.6,
        color: "transparent",
        whiteSpace: "pre",
      },
      input: {
        padding: "12px 20px",
        outline: "none",
        fontSize: 14,
        lineHeight: 1.6,
        color: "inherit",
        backgroundColor: "transparent",
      },
    },
  } as const;
}
