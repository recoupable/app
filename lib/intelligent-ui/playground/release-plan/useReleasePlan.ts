"use client";
import { useEffect, useState } from "react";
import { readReleasePlan } from "./readReleasePlan";
import { saveReleasePlan } from "./saveReleasePlan";
import { resolveReleasePlan } from "./resolveReleasePlan";
import { getReleasePlanDiff } from "./getReleasePlanDiff";
import type {
  LocalPlanBase,
  ReleasePlanEdits,
  ReleasePlanFixture,
} from "./types";

/** The caller keys this editor by fixture scope; unsaved edits stay in memory only. */
export function useReleasePlan(fixture: ReleasePlanFixture) {
  const [base, setBase] = useState<LocalPlanBase>({
    version: 0,
    edits: fixture.initial,
    token: null,
  });
  const [edits, setEdits] = useState(fixture.initial);
  const [ready, setReady] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [message, setMessage] = useState("Restoring this tab's local plan…");
  const [review, setReview] = useState<{
    edits: ReleasePlanEdits;
    changes: string[];
  } | null>(null);
  const restore = () => {
    try {
      const loaded = readReleasePlan(window.sessionStorage, fixture);
      setBase(loaded);
      setEdits(loaded.edits);
      setReview(null);
      setCanSave(true);
      setMessage(
        loaded.version
          ? `Restored local version ${loaded.version}. No tasks were approved or executed.`
          : "No saved version in this tab. Review the example dates before saving.",
      );
    } catch {
      setCanSave(false);
      setMessage(
        "This tab's stored plan is unavailable or invalid. It has not been overwritten. Keep editing and use the readable plan below; local saving is unavailable.",
      );
    }
    setReady(true);
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore browser-only session storage after hydration.
    restore();
    // The keyed host provides one immutable fixture for this mounted editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return {
    base,
    edits,
    ready,
    canSave,
    message,
    review,
    restore,
    update(next: ReleasePlanEdits) {
      setEdits(next);
      setReview(null);
    },
    prepare() {
      const proposed = resolveReleasePlan(edits);
      setReview({
        edits: proposed.edits,
        changes: getReleasePlanDiff(base.edits, proposed.edits),
      });
      setMessage(
        "Review the proposed local version below. Nothing has been saved yet.",
      );
    },
    save() {
      if (!ready || !canSave || !review) return;
      try {
        const result = saveReleasePlan(
          window.sessionStorage,
          fixture,
          base,
          review.edits,
        );
        setBase(result.base);
        setEdits(result.base.edits);
        setReview(null);
        setMessage(
          `${result.status === "duplicate" ? "Already saved as" : "Saved"} local version ${result.base.version} in this tab. No tasks were approved or executed.`,
        );
      } catch (error) {
        setReview(null);
        setMessage(
          error instanceof Error
            ? error.message
            : "Local save failed. Your edits remain visible.",
        );
      }
    },
  };
}
