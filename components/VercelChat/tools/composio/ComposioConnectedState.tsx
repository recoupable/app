"use client";

import {
  CheckCircle2,
  FileSpreadsheet,
  HardDrive,
  FileText,
  Link2,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { ToolCard, ToolCardBody } from "../shared/ToolCard";

interface ComposioConnectedStateProps {
  displayName: string;
  /** Stable connector slug (e.g. "googlesheets"); preferred over displayName for icon resolution. */
  connector?: string;
}

function resolveProviderIcon(value: string): LucideIcon {
  const key = value.toLowerCase();
  if (key.includes("sheet")) return FileSpreadsheet;
  if (key.includes("drive")) return HardDrive;
  if (key.includes("doc")) return FileText;
  return Link2;
}

/**
 * Component shown when a connector is successfully connected.
 */
export function ComposioConnectedState({
  displayName,
  connector,
}: ComposioConnectedStateProps) {
  const reduceMotion = useReducedMotion();
  // Prefer the stable connector slug; fall back to the human display name.
  const ProviderIcon = resolveProviderIcon(connector ?? displayName);

  return (
    <ToolCard
      icon={CheckCircle2}
      tone="success"
      emphasized
      title={`${displayName} connected`}
      subtitle="Ready to use"
      className="max-w-md"
    >
      <ToolCardBody>
        <div className="flex items-center gap-3 rounded-xl bg-emerald-500/5 px-3 py-2.5">
          <motion.span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400"
            initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProviderIcon className="size-4" />
          </motion.span>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You can now use {displayName} in your workflows.
          </p>
        </div>
      </ToolCardBody>
    </ToolCard>
  );
}

export default ComposioConnectedState;
