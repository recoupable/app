"use client";

import { usePulseToggle } from "@/hooks/usePulseToggle";
import PulseToggle from "@/components/Pulse/PulseToggle";
import PulseToggleSkeleton from "@/components/Pulse/PulseToggleSkeleton";
import { Activity, Bell, ArrowUpRight } from "lucide-react";
import type { Pulse } from "@/lib/pulse/getPulse";
import { ToolCard, ToolCardBody } from "../shared/ToolCard";
import { ToolError } from "../shared/ToolError";

type PulseSuccessResult = {
  status: "success";
  pulses: Pulse[];
};

type PulseErrorResult = {
  error: number;
  message: string;
};

export type PulseToolResultType = PulseSuccessResult | PulseErrorResult;

export default function PulseToolResult({
  result,
}: {
  result: PulseToolResultType;
}) {
  const { active, isInitialLoading, isToggling, togglePulse } =
    usePulseToggle();

  if ("error" in result) {
    return <ToolError title="Pulse" message={result.message} />;
  }

  // Color must tell the truth: emerald only when the digest is actually on.
  const tone = isInitialLoading ? "neutral" : active ? "success" : "neutral";

  return (
    <ToolCard
      icon={Activity}
      tone={tone}
      title={
        <a
          href="/tasks?tab=pulses"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 transition-colors hover:text-primary"
        >
          Pulse
          <ArrowUpRight className="size-3.5 opacity-60" />
        </a>
      }
      subtitle="Daily digest notifications"
      className="max-w-sm"
    >
      <ToolCardBody>
        <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bell className="size-4" />
            Daily notifications
          </span>
          {isInitialLoading ? (
            <PulseToggleSkeleton />
          ) : (
            <PulseToggle
              active={active}
              isToggling={isToggling}
              onToggle={togglePulse}
            />
          )}
        </div>
      </ToolCardBody>
    </ToolCard>
  );
}
