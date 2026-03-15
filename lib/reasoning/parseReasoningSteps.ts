/**
 * Simplified Reasoning Parser
 *
 * Converts unstructured reasoning text into structured steps.
 * Single responsibility: Main parsing orchestration with simplified logic.
 */

import { ReasoningStep } from "./types";
import { extractHeaderSteps } from "./extractors/headerExtractor";
import { extractParagraphSteps } from "./extractors/paragraphExtractor";
import { mapContentToActionLabel } from "./mappers/actionLabelMapper";
import { mapContentToIcon } from "./mappers/iconMapper";
import { removeFirstLine } from "./shared/parseUtilities";
import { BrainIcon } from "lucide-react";

/**
 * Parse reasoning content into structured steps (simplified to 2 strategies)
 *
 * @param content
 * @param isStreaming
 */
export function parseReasoningSteps(
  content: string,
  isStreaming: boolean = false,
): ReasoningStep[] {
  if (!content?.trim()) {
    return [];
  }

  // Remove title from content to avoid duplication with header
  const contentWithoutTitle = removeFirstLine(content);
  if (!contentWithoutTitle.trim()) {
    return [];
  }

  // Strategy 1: Try header-based extraction (most structured)
  const headerSteps = extractHeaderSteps(contentWithoutTitle);
  if (headerSteps.length > 0) {
    return convertToReasoningSteps(headerSteps, isStreaming);
  }

  // Strategy 2: Fallback to paragraph-based extraction
  const paragraphSteps = extractParagraphSteps(contentWithoutTitle);
  if (paragraphSteps.length > 0) {
    return convertToReasoningSteps(paragraphSteps, isStreaming);
  }

  // Final fallback: Single step
  return [
    {
      icon: BrainIcon,
      label: "Analysis",
      status: isStreaming ? "active" : "complete",
      content: contentWithoutTitle,
    },
  ];
}

/**
 * Convert parsed steps to reasoning steps with metadata
 *
 * @param steps
 * @param isStreaming
 */
function convertToReasoningSteps(
  steps: Array<{ label: string; content: string }>,
  isStreaming: boolean,
): ReasoningStep[] {
  return steps.map((step, index) => ({
    icon: mapContentToIcon(step.content),
    label: mapContentToActionLabel(step.content),
    status: getStepStatus(index, steps.length, isStreaming),
    content: step.content,
  }));
}

/**
 * Determine step status based on position and streaming state
 *
 * @param stepIndex
 * @param totalSteps
 * @param isStreaming
 */
function getStepStatus(
  stepIndex: number,
  totalSteps: number,
  isStreaming: boolean,
): "complete" | "active" | "pending" {
  if (!isStreaming) {
    return "complete";
  }

  // Simple streaming logic: assume 70% progress
  const currentStep = Math.floor(totalSteps * 0.7);

  if (stepIndex < currentStep) return "complete";
  if (stepIndex === currentStep) return "active";
  return "pending";
}
