"use client";

import { useMemo, useState } from "react";
import { useExampleReplay } from "@/lib/intelligent-ui/playground/useExampleReplay";
import { getCompletedExample } from "@/lib/intelligent-ui/playground/getCompletedExample";
import { resolvePlaygroundAsset } from "@/lib/intelligent-ui/playground/resolvePlaygroundAsset";
import type { PlaygroundScenario } from "@/lib/intelligent-ui/playground/scenarios";
import type { ConversationExample } from "@/lib/intelligent-ui/playground/conversationExamples";
import AnswerRenderer from "./AnswerRenderer";
import EvidenceDialog from "./EvidenceDialog";
import PlaygroundDetails from "./PlaygroundDetails";

export default function PlaygroundWorkspace({
  scenario,
  example,
}: {
  scenario: PlaygroundScenario;
  example: ConversationExample;
}) {
  const replay = useExampleReplay(scenario);
  const baseline = useMemo(() => getCompletedExample(scenario), [scenario]);
  const surface = replay.completedSurface ?? baseline;
  const [evidenceId, setEvidenceId] = useState<string | null>(null);
  const [sourceTrigger, setSourceTrigger] = useState<HTMLElement | null>(null);
  return (
    <section
      id="conversation"
      tabIndex={-1}
      className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`${example.label} conversation`}
    >
      <div
        aria-label="Your question"
        className="mb-9 ml-auto w-fit max-w-[90%] rounded-[20px] rounded-br-md bg-muted px-4 py-3 text-base leading-7 sm:max-w-[85%] sm:px-5"
      >
        {example.prompt}
      </div>
      <AnswerRenderer
        surface={surface}
        resolveAudioAsset={resolvePlaygroundAsset}
        onInspectEvidence={(id, trigger) => {
          setSourceTrigger(trigger);
          setEvidenceId(id);
        }}
      />
      <EvidenceDialog
        evidence={
          surface.evidence.find((item) => item.id === evidenceId) ?? null
        }
        onClose={() => setEvidenceId(null)}
        returnFocus={sourceTrigger}
      />
      <PlaygroundDetails
        surface={surface}
        streamedSurface={replay.surface}
        status={replay.status}
        error={replay.error}
        replay={() => void replay.replay()}
        stop={replay.stop}
      />
    </section>
  );
}
