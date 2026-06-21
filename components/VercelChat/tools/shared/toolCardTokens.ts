/**
 * Shared visual tokens for chat tool-response cards.
 *
 * Centralizing the accent palette keeps every tool card on the same design
 * language ("award-winning" comes from consistency, not novelty). Each tone
 * maps to a tinted icon chip + matching ring/border so loading, success,
 * empty and error states read instantly across the whole tool surface.
 */

export type ToolTone =
  | "neutral"
  | "success"
  | "error"
  | "info"
  | "accent"
  | "warning";

interface ToneStyle {
  /** Background tint for the icon chip. */
  chipBg: string;
  /** Foreground color for the icon inside the chip. */
  chipText: string;
  /** Optional subtle accent ring used on emphasized cards. */
  ring: string;
  /** Solid-ish dot used in compact rows / pills. */
  dot: string;
}

export const TOOL_TONES: Record<ToolTone, ToneStyle> = {
  neutral: {
    chipBg: "bg-muted",
    chipText: "text-foreground/70",
    ring: "ring-border",
    dot: "bg-muted-foreground",
  },
  success: {
    chipBg: "bg-emerald-500/10",
    chipText: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/20",
    dot: "bg-emerald-500",
  },
  error: {
    chipBg: "bg-destructive/10",
    chipText: "text-destructive",
    ring: "ring-destructive/20",
    dot: "bg-destructive",
  },
  info: {
    chipBg: "bg-blue-500/10",
    chipText: "text-blue-600 dark:text-blue-400",
    ring: "ring-blue-500/20",
    dot: "bg-blue-500",
  },
  accent: {
    chipBg: "bg-violet-500/10",
    chipText: "text-violet-600 dark:text-violet-400",
    ring: "ring-violet-500/20",
    dot: "bg-violet-500",
  },
  warning: {
    chipBg: "bg-amber-500/10",
    chipText: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/20",
    dot: "bg-amber-500",
  },
};

/** Shared entrance motion for tool cards (fade + gentle rise). */
export const toolCardMotion = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};
