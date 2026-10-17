"use client";

import type { Surface } from "@/lib/intelligent-ui/schema";
import type { RepresentationCapabilities } from "@/lib/intelligent-ui/presentation/types";
import { selectPresentation } from "@/lib/intelligent-ui/presentation/selectPresentation";
import { describeConcentration } from "@/lib/intelligent-ui/representations/describeConcentration";
import { getRepresentationText } from "@/lib/intelligent-ui/representations/getRepresentationText";
import { getTimelineStateKey } from "@/lib/intelligent-ui/representations/getTimelineStateKey";
import MarkdownPart from "./MarkdownPart";
import DistributionView from "./DistributionView";
import TimelineView from "./TimelineView";

export default function AnswerRenderer({
  surface,
  onInspectEvidence,
  capabilities = { distribution: true, timeline: true },
  resolveAudioAsset,
}: {
  surface: Surface;
  onInspectEvidence: (id: string, trigger: HTMLElement) => void;
  capabilities?: RepresentationCapabilities;
  resolveAudioAsset?: (assetId: string) => string | undefined;
}) {
  const scope = `${surface.context.workspaceId}:${surface.context.subject.kind}:${surface.context.subject.id}`;
  if (!surface.answer)
    return (
      <p className="whitespace-pre-wrap text-base leading-7">
        {surface.fallbackText}
      </p>
    );
  return (
    <article aria-label="Recoup response" className="space-y-7 sm:space-y-8">
      {surface.answer.parts.map((part) => {
        if (part.type === "markdown")
          return <MarkdownPart key={part.id} text={part.text} />;
        if (part.type === "insight") {
          const component = surface.components.find(
            (item) => item.id === part.componentId,
          );
          return component?.type === "distribution" ? (
            <p key={part.id} className="text-base leading-7 [text-wrap:pretty]">
              {describeConcentration(component, part.count)}
            </p>
          ) : null;
        }
        if (part.type === "sources")
          return (
            <div
              key={part.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-1"
            >
              {part.evidenceIds.map((id) => {
                const evidence = surface.evidence.find(
                  (item) => item.id === id,
                );
                return evidence ? (
                  <button
                    key={id}
                    type="button"
                    onClick={(event) =>
                      onInspectEvidence(id, event.currentTarget)
                    }
                    className="min-h-11 cursor-pointer rounded-md text-xs text-muted-foreground underline decoration-border underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {evidence.label}
                    {evidence.status !== "current"
                      ? ` · ${evidence.status}`
                      : ""}
                  </button>
                ) : null;
              })}
            </div>
          );
        const decision = selectPresentation(
          surface,
          {
            kind: "representation",
            componentId: part.componentId,
            benefit: part.benefit,
          },
          capabilities,
        );
        const component = surface.components.find(
          (item) => item.id === part.componentId,
        );
        if (decision.mode === "text")
          return component &&
            (component.type === "distribution" ||
              component.type === "timeline") ? (
            <p key={part.id} className="whitespace-pre-wrap text-sm leading-7">
              {getRepresentationText(component)}
            </p>
          ) : null;
        if (decision.component.type === "distribution")
          return (
            <DistributionView key={part.id} component={decision.component} />
          );
        return (
          <TimelineView
            key={`${part.id}:${getTimelineStateKey(decision.component, scope)}`}
            component={decision.component}
            scope={scope}
            audioUrl={
              decision.component.media &&
              resolveAudioAsset?.(decision.component.media.assetId)
            }
          />
        );
      })}
    </article>
  );
}
