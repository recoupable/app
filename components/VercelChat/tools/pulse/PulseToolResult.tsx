"use client";

import { usePulseToggle } from "@/hooks/usePulseToggle";
import PulseToggle from "@/components/Pulse/PulseToggle";
import PulseToggleSkeleton from "@/components/Pulse/PulseToggleSkeleton";
import { CheckCircle, XCircle, Activity } from "lucide-react";
import type { Pulse } from "@/lib/pulse/getPulse";

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
    return (
      <div className="flex items-center space-x-3 p-3 rounded-lg bg-red-50 border border-red-200 my-1 w-fit">
        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="h-4 w-4 text-red-600" />
        </div>
        <div>
          <p className="font-medium text-sm text-red-800">Pulse error</p>
          <p className="text-xs text-red-600">{result.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 max-w-sm shadow-sm">
      <div className="flex items-start space-x-3 mb-3">
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
        <div className="flex-1">
          <a
            href="/tasks?tab=pulses"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-foreground flex items-center space-x-2 hover:text-primary transition-colors"
          >
            <Activity className="h-4 w-4" />
            <span>Pulse</span>
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <span className="text-sm text-muted-foreground">Daily notifications</span>
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
    </div>
  );
}
