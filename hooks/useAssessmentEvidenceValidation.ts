"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReleaseCaseRequest } from "./useReleaseCaseRequest";
import { readAssessmentEvidenceValidation } from "@/lib/releases/assessmentEvidence/readAssessmentEvidenceValidation";
import type { captureAssessmentEvidence } from "@/lib/releases/assessmentEvidence/captureAssessmentEvidence";
type Result = ReturnType<typeof readAssessmentEvidenceValidation>;
type State = Result | { state: "idle" | "pending" | "error" };
export function useAssessmentEvidenceValidation(
  organizationId: string | null,
  getAccessToken: () => Promise<string | null>,
  isCurrent: () => boolean,
) {
  const [status, setStatus] = useState<State>({ state: "idle" });
  const generation = useRef(0);
  const getGeneration = useCallback(
    () => (isCurrent() ? generation.current : -1),
    [isCurrent],
  );
  const request = useReleaseCaseRequest(
    organizationId,
    getAccessToken,
    getGeneration,
  );
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  const invalidate = () => {
    generation.current++;
    setStatus({ state: "idle" });
  };
  const validate = async (
    captured: NonNullable<ReturnType<typeof captureAssessmentEvidence>>,
  ) => {
    if (!isCurrent()) return;
    const revision = ++generation.current;
    setStatus({ state: "pending" });
    try {
      const response = await request(
        {
          action: "read_brief",
          ...captured,
          explain_evidence_validation: true,
        },
        revision,
      );
      if (revision !== getGeneration()) return;
      setStatus(readAssessmentEvidenceValidation(response, captured));
    } catch {
      if (revision === getGeneration()) setStatus({ state: "error" });
    }
  };
  return { status, invalidate, validate };
}
