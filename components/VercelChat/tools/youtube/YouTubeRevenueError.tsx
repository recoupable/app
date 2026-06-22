import React from "react";
import { Youtube, PlugZap } from "lucide-react";
import { ToolCard, ToolCardBody } from "../shared/ToolCard";
import { ToolError } from "../shared/ToolError";

interface YouTubeRevenueErrorProps {
  message?: string;
}

export default function YouTubeRevenueError({
  message,
}: YouTubeRevenueErrorProps) {
  const text = (message ?? "").toLowerCase();
  const looksLikeNotConnected =
    text.includes("connect") ||
    text.includes("not linked") ||
    text.includes("authoriz") ||
    text.includes("permission") ||
    text.includes("scope");

  // When the failure is a connection/permission gap, guide the next step
  // instead of presenting a dead-end error.
  if (looksLikeNotConnected) {
    return (
      <ToolCard
        icon={Youtube}
        tone="warning"
        emphasized
        title="Connect YouTube to see revenue"
        subtitle="Channel access needed"
        className="max-w-md"
      >
        <ToolCardBody className="space-y-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {message ||
              "We couldn't read revenue for this channel. Connecting YouTube Analytics with the right permissions will let us pull it in."}
          </p>
          <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <PlugZap className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            Ask to connect your YouTube account, then try again.
          </div>
        </ToolCardBody>
      </ToolCard>
    );
  }

  return <ToolError title="YouTube revenue" message={message} />;
}
