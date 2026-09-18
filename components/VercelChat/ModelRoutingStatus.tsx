import React from "react";
import { z } from "zod";
import { getFeaturedModelConfig } from "@/lib/ai/featuredModels";

const routingSchema = z.object({
  routing: z.discriminatedUnion("status", [
    z.object({ status: z.literal("selecting") }),
    z.object({
      status: z.literal("selected"),
      source: z.enum(["jev", "fallback"]),
      modelId: z.string(),
      tier: z.enum(["fast", "balanced", "frontier"]),
      reason: z.string(),
      reasoningEffort: z.enum(["low", "medium", "high"]).optional(),
      reasoningConfidence: z.number().min(0).max(1).optional(),
      confidence: z.number().min(0).max(1).optional(),
    }),
  ]),
});

/** Metadata is persisted with each answer, so routing stays visible after reload. */
export function ModelRoutingStatus({ metadata }: { metadata: unknown }) {
  const parsed = routingSchema.safeParse(metadata);
  if (!parsed.success) return null;
  const { routing } = parsed.data;
  if (routing.status === "selecting") {
    return (
      <div
        role="status"
        className="px-2 py-1 text-xs text-muted-foreground motion-safe:animate-pulse"
      >
        Jev is choosing a model…
      </div>
    );
  }
  const name =
    getFeaturedModelConfig(routing.modelId)?.displayName ??
    (routing.modelId === "openai/gpt-6-astra" ? "Astra" : routing.modelId);
  return (
    <details className="group/routing relative min-w-0 text-xs text-muted-foreground">
      <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
        <span className="font-medium">{name}</span>
        {routing.reasoningEffort && ` · ${routing.reasoningEffort} reasoning`}
        <span
          aria-hidden="true"
          className="ml-1 text-[10px] transition-transform group-open/routing:rotate-180"
        >
          ⌄
        </span>
        <span className="sr-only"> · Routing details</span>
      </summary>
      <div className="mt-2 w-72 max-w-[calc(100vw-3rem)] rounded-xl bg-popover p-3 text-popover-foreground shadow-md ring-1 ring-border">
        <p className="font-medium">
          {routing.source === "jev" ? "Chosen by Jev" : "Auto fallback"}
        </p>
        <p className="mt-2 leading-relaxed">{routing.reason}</p>
        {routing.reasoningConfidence !== undefined && (
          <p className="mt-1">
            Reasoning confidence:{" "}
            {Math.round(routing.reasoningConfidence * 100)}%
          </p>
        )}
        {routing.confidence !== undefined && (
          <p className="mt-1">
            Routing confidence: {Math.round(routing.confidence * 100)}%
          </p>
        )}
      </div>
    </details>
  );
}
