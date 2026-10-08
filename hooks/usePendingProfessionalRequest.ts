"use client";
import { useEffect, useState } from "react";
import {
  pendingProfessionalSchema,
  type ProfessionalRequest,
} from "@/lib/professionals/schema";

/** Restore only after hydration, before allowing another operation to be submitted. */
export function usePendingProfessionalRequest(
  actorId: string,
  organizationId: string,
) {
  const storageKey = `professional-roster-pending:${actorId}:${organizationId}`;
  const [pending, setPending] = useState<ProfessionalRequest | null>(null);
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    try {
      const saved = pendingProfessionalSchema.safeParse(
        JSON.parse(sessionStorage.getItem(storageKey) || "null"),
      );
      // Client-only storage must be restored after hydration, before submission.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPending(
        saved.success && saved.data.organization_id === organizationId
          ? saved.data
          : null,
      );
    } catch {
      setPending(null);
    }
    setRestored(true);
  }, [storageKey, organizationId]);
  return { storageKey, pending, setPending, restored };
}
