"use client";

import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { useTaskRunStatus } from "@/hooks/useTaskRunStatus";
import RunDetails from "@/components/TasksPage/Run/RunDetails";
import { toolCardMotion } from "../shared/toolCardTokens";
import { ToolError } from "../shared/ToolError";

/**
 * Terminal-style loading frame shown while the sandbox run is polling.
 * Mirrors the resolved RunDetails layout to avoid a jarring transition.
 */
function SandboxRunningSkeleton() {
  return (
    <motion.div
      initial={toolCardMotion.initial}
      animate={toolCardMotion.animate}
      transition={toolCardMotion.transition}
      className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex size-9 shrink-0 animate-pulse items-center justify-center rounded-xl bg-muted text-foreground/70">
          <Terminal className="size-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            Running command…
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Executing in a secure sandbox
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          <span className="size-1.5 animate-pulse rounded-full bg-amber-500" />
          In progress
        </span>
      </div>

      {/* Terminal-style output placeholder */}
      <div className="border-t border-border/60 p-3">
        <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-3 font-mono">
          <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3.5 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </motion.div>
  );
}

export default function RunSandboxCommandResultWithPolling({
  runId,
}: {
  runId: string;
}) {
  const { data, isLoading } = useTaskRunStatus(runId);

  if (isLoading) {
    return <SandboxRunningSkeleton />;
  }

  // Polling finished but no run data is available — surface an error instead of
  // spinning the skeleton forever.
  if (!data) {
    return (
      <ToolError
        title="Sandbox"
        message="We couldn't load the sandbox run results. Please try again."
      />
    );
  }

  return <RunDetails runId={runId} data={data} />;
}
