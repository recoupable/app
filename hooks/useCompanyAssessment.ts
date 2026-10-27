"use client";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type {
  CompanyAssessmentBrief,
  CompanyAssessmentSnapshot,
} from "@/lib/releases/assessmentTypes";
import { ReleaseCaseRequestError } from "@/lib/releases/errors";
import { useReleaseCaseRequest } from "./useReleaseCaseRequest";
export function useCompanyAssessment(
  requestId: string,
  organizationId: string | null,
  getAccessToken: () => Promise<string | null>,
) {
  const [brief, setBrief] = useState<CompanyAssessmentBrief | null>(null);
  const [snapshot, setSnapshot] = useState<CompanyAssessmentSnapshot | null>(
    null,
  );
  const [retrySave, setRetrySave] = useState(false);
  const inFlight = useRef(false);
  const [savedId, setSavedId] = useState("");
  const [openId, setOpenId] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const generation = useRef(0);
  const workKey = useRef<string | null>(null);
  const getGeneration = useCallback(() => generation.current, []);
  const request = useReleaseCaseRequest(
    organizationId,
    getAccessToken,
    getGeneration,
  );
  useLayoutEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  const run = async (action: "brief" | "save_brief" | "read_brief") => {
    if (inFlight.current) return;
    inFlight.current = true;
    const revision = generation.current;
    setBusy(true);
    setNotice("");
    try {
      if (action === "brief") {
        const result = await request(
          { action, request_id: requestId, purpose: "company_onboarding" },
          revision,
        );
        if (result.purpose !== "company_onboarding")
          throw new Error("Unexpected assessment purpose");
        if (revision === generation.current) {
          setSnapshot(null);
          setRetrySave(false);
          setSavedId("");
          setOpenId("");
          workKey.current = null;
          setBrief(result);
        }
      } else {
        if (action === "save_brief")
          workKey.current ??= `company-assessment:${crypto.randomUUID()}`;
        const result =
          action === "save_brief"
            ? await request(
                {
                  action,
                  request_id: requestId,
                  purpose: "company_onboarding",
                  idempotency_key: workKey.current,
                },
                revision,
              )
            : await request({ action, brief_id: openId.trim() }, revision);
        if (revision !== generation.current) return;
        setRetrySave(false);
        if (
          result.snapshot.brief &&
          result.snapshot.brief.purpose !== "company_onboarding"
        )
          throw new Error("Unexpected assessment purpose");
        if (result.snapshot.state !== "saved" || !result.snapshot.brief) {
          setSnapshot(null);
          setBrief(null);
          setSavedId("");
          setNotice(
            "This saved assessment is unavailable. Check current access and evidence.",
          );
        } else {
          setSnapshot(result.snapshot);
          setBrief(result.snapshot.brief);
          setSavedId(result.snapshot.id);
          setOpenId(result.snapshot.id);
          const confirmation =
            action === "read_brief"
              ? "Saved assessment reopened."
              : "Assessment saved. Keep its ID to reopen later.";
          setNotice(
            result.snapshot.superseded
              ? `${confirmation} Newer evidence is available.`
              : confirmation,
          );
        }
      }
    } catch (error) {
      if (revision === generation.current) {
        setBrief(null);
        setSnapshot(null);
        setSavedId("");
        setRetrySave(
          action === "save_brief" &&
            (!(error instanceof ReleaseCaseRequestError) ||
              (error.status !== undefined && error.status >= 500)),
        );
        setNotice(
          error instanceof ReleaseCaseRequestError
            ? error.message
            : "Assessment unavailable. Check your workspace and that the request has saved partial or completed evidence.",
        );
      }
    } finally {
      if (revision === generation.current) {
        setBusy(false);
        inFlight.current = false;
      }
    }
  };
  return {
    brief,
    snapshot,
    retrySave,
    savedId,
    openId,
    setOpenId,
    busy,
    notice,
    run,
  };
}
