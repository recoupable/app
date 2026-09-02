"use client";

import { Zap } from "lucide-react";
import type { ToolRenderState } from "@/lib/chat/extractToolRenderState";
import { ToolLayout } from "./ToolLayout";

export interface SkillOutput {
  success?: boolean;
  error?: string;
  skillName?: string;
}

export interface SkillRendererProps {
  input?: { skill?: string; args?: string };
  output?: SkillOutput;
  state: ToolRenderState;
}

/**
 * Names the recipe the agent is following. A music video is a chain, not a
 * call, so knowing *which* skill is running is most of the progress story.
 *
 * Ported from `open-agents` (`renderers/skill-renderer.tsx`).
 */
export function SkillRenderer({ input, output, state }: SkillRendererProps) {
  const skillName = input?.skill?.trim();
  const args = input?.args?.trim();
  // The skill tool reports "not found" as a successful call with success:false,
  // so the row has to read the output to know it failed.
  const outputError =
    output?.success === false ? (output.error ?? "Skill failed") : undefined;

  const mergedState: ToolRenderState = outputError
    ? { ...state, error: state.error ?? outputError }
    : state;

  return (
    <ToolLayout
      name="Skill"
      icon={<Zap className="h-3.5 w-3.5" />}
      summary={skillName ? `/${skillName}` : "…"}
      state={mergedState}
      expandedContent={
        args ? (
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-muted/50 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
            {args}
          </pre>
        ) : undefined
      }
    />
  );
}
