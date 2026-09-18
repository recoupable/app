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
        className="mb-3 text-xs text-muted-foreground motion-safe:animate-pulse"
      >
        Jev is choosing a model…
      </div>
    );
  }
  const name =
    getFeaturedModelConfig(routing.modelId)?.displayName ?? routing.modelId;
  return (
    <details className="mb-3 rounded-lg px-3 py-2 text-xs text-muted-foreground shadow-[0_0_0_1px_var(--border)]">
      <summary className="cursor-pointer rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
        <span className="font-medium text-foreground">{name}</span>
        {routing.reasoningEffort && ` · ${routing.reasoningEffort} reasoning`}
        {" · "}
        {routing.source === "jev" ? "Chosen by Jev" : "Auto fallback"}
      </summary>
      <p className="mt-2 leading-relaxed">{routing.reason}</p>
      {routing.reasoningConfidence !== undefined && (
        <p className="mt-1">Reasoning confidence: {Math.round(routing.reasoningConfidence * 100)}%</p>
      )}
      {routing.confidence !== undefined && (
        <p className="mt-1">
          Routing confidence: {Math.round(routing.confidence * 100)}%
        </p>
      )}
    </details>
  );
}
