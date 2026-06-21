"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolTone, TOOL_TONES, toolCardMotion } from "./toolCardTokens";

/**
 * ToolCard — the single, shared shell for every chat tool response.
 *
 * Goals:
 *  - One consistent design language across all tools (radius, border, shadow,
 *    spacing, header anatomy) so the chat surface feels intentional.
 *  - Built-in tonal accents (success / error / info / loading) via a tinted
 *    icon chip, so users parse the state of a response at a glance.
 *  - A subtle, tasteful entrance animation shared by every card.
 *
 * Compose with ToolCardBody / ToolCardRow, or pass `children` directly.
 */

interface ToolCardProps {
  /** Lucide icon rendered in the tinted header chip. */
  icon?: LucideIcon;
  /** Custom node rendered in place of the icon chip (e.g. an artist avatar). */
  media?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Tonal accent driving the chip + optional ring. Defaults to neutral. */
  tone?: ToolTone;
  /** Trailing header slot — counts, badges, links, actions. */
  trailing?: React.ReactNode;
  /** Render a soft accent ring around the whole card. */
  emphasized?: boolean;
  /** Show the header chip in a pulsing "loading" treatment. */
  loading?: boolean;
  className?: string;
  /** Disable the entrance animation (e.g. nested cards). */
  noAnimation?: boolean;
  children?: React.ReactNode;
}

export function ToolCard({
  icon: Icon,
  media,
  title,
  subtitle,
  tone = "neutral",
  trailing,
  emphasized = false,
  loading = false,
  className,
  noAnimation = false,
  children,
}: ToolCardProps) {
  const toneStyle = TOOL_TONES[tone];

  const header = (
    <div className="flex items-start gap-3 px-4 py-3">
      {media ? (
        <div className="shrink-0">{media}</div>
      ) : Icon ? (
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
            toneStyle.chipBg,
            toneStyle.chipText,
            loading && "animate-pulse",
          )}
        >
          <Icon className="size-[18px]" strokeWidth={2} />
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold leading-tight text-foreground">
            {title}
          </h3>
        </div>
        {subtitle ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>

      {trailing ? (
        <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
          {trailing}
        </div>
      ) : null}
    </div>
  );

  const body = (
    <div
      className={cn(
        "group/toolcard w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md",
        emphasized && cn("ring-1", toneStyle.ring),
        className,
      )}
    >
      {header}
      {children ? (
        <div className="border-t border-border/60">{children}</div>
      ) : null}
    </div>
  );

  if (noAnimation) return body;

  return (
    <motion.div
      initial={toolCardMotion.initial}
      animate={toolCardMotion.animate}
      transition={toolCardMotion.transition}
    >
      {body}
    </motion.div>
  );
}

/** Padded content region for the card body. */
export function ToolCardBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("p-3", className)}>{children}</div>;
}

/** A single tappable/linkable row, styled consistently across tools. */
export function ToolCardRow({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-muted/60",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default ToolCard;
