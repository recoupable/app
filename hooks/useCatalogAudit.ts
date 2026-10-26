"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { canContinueAudit } from "@/lib/catalogAudit/canContinueAudit";
import { appendAuditNote } from "@/lib/catalogAudit/appendAuditNote";
import {
  pageSchema,
  parsePrepared,
  parseReceipt,
  type AuditPage,
  type AuditSnapshot,
} from "@/lib/catalogAudit/schemas";

interface Options {
  accountId: string;
  organizationId: string | null;
  apiSelection: string;
  getAccessToken: () => Promise<string | null>;
}
interface SaveAttempt {
  action: "save_catalog_case";
  case_id: string;
  expected_revision: number;
  idempotency_key: string;
  snapshot: AuditSnapshot;
}
class RequestError extends Error {
  constructor(public status: number) {
    super("Audit request failed");
  }
}

/** Mounted only inside a keyed, authenticated workspace boundary. Nothing is cached on disk. */
export function useCatalogAudit({
  accountId,
  organizationId,
  apiSelection,
  getAccessToken,
}: Options) {
  const workspaceId = organizationId ?? accountId;
  const [items, setItems] = useState<AuditPage["cases"]>([]);
  const [nextId, setNextId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<AuditSnapshot | null>(null);
  const [saved, setSaved] = useState(false);
  const [writable, setWritable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [note, setNote] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const [recoveryId, setRecoveryId] = useState<string | null>(null);
  const pending = useRef<SaveAttempt | null>(null);
  const inFlight = useRef(false);
  const active = useRef(false);
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const tokenReader = useRef(getAccessToken);
  useLayoutEffect(() => {
    tokenReader.current = getAccessToken;
  }, [getAccessToken]);
  useLayoutEffect(() => {
    const epoch = generation.current;
    active.current = true;
    return () => {
      active.current = false;
      generation.current = epoch + 1;
      inFlight.current = false;
      controller.current?.abort();
    };
  }, []);
  const isCurrent = useCallback(
    () => active.current && getClientApiBaseUrl() === apiSelection,
    [apiSelection],
  );
  const request = useCallback(
    async (body: Record<string, unknown>) => {
      if (!isCurrent()) throw new Error("Connection changed");
      const epoch = generation.current;
      const requestController = new AbortController();
      controller.current = requestController;
      const token = await tokenReader.current();
      if (
        !isCurrent() ||
        generation.current !== epoch ||
        requestController.signal.aborted
      )
        throw new Error("Workspace changed");
      if (!token) throw new RequestError(401);
      const response = await fetch("/api/context", {
        method: "POST",
        cache: "no-store",
        redirect: "error",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...body,
          ...(organizationId ? { organization_id: organizationId } : {}),
        }),
        signal: AbortSignal.any([
          requestController.signal,
          AbortSignal.timeout(30000),
        ]),
      });
      if (
        !isCurrent() ||
        generation.current !== epoch ||
        requestController.signal.aborted
      )
        throw new Error("Workspace changed");
      if (!response.ok) throw new RequestError(response.status);
      const raw: unknown = await response.json();
      if (
        !isCurrent() ||
        generation.current !== epoch ||
        requestController.signal.aborted
      )
        throw new Error("Workspace changed");
      return raw;
    },
    [isCurrent, organizationId],
  );

  const clearCurrent = () => {
    setSnapshot(null);
    setWritable(false);
    setSaved(false);
    setNote("");
  };
  const run = async (operation: () => Promise<void>, saving = false) => {
    if (inFlight.current || !isCurrent()) return;
    const epoch = generation.current;
    inFlight.current = true;
    setBusy(true);
    setNotice("");
    try {
      await operation();
    } catch (error) {
      if (!isCurrent() || generation.current !== epoch) return;
      const status = error instanceof RequestError ? error.status : undefined;
      const definitiveRejection =
        status === 401 ||
        status === 403 ||
        (saving && (status === 400 || status === 422));
      clearCurrent();
      // A successful HTTP response can still lose its receipt. Catalog 409 also
      // covers storage failures, not just CAS conflicts: retain the frozen write.
      if (pending.current && !definitiveRejection) {
        setUncertain(true);
        setRecoveryId(pending.current.case_id);
        setNotice(
          status === 409
            ? "The save could not be confirmed; the audit may have changed. Reopen the latest saved version or retry the exact save."
            : "Save confirmation was interrupted. Retry the exact save or check the saved audit before making changes.",
        );
      } else {
        pending.current = null;
        setUncertain(false);
        if (status === 401 || status === 403) {
          setItems([]);
          setNextId(null);
          setRecoveryId(null);
        }
        setNotice(
          status === 409
            ? "This audit changed elsewhere. Reopen the latest saved version before continuing."
            : status === 401
              ? "Please sign in again to review this workspace."
              : status === 403 || status === 404
                ? "This audit or its evidence is unavailable in this workspace."
                : "The audit could not be verified. Reopen it before continuing.",
        );
      }
    } finally {
      if (isCurrent() && generation.current === epoch) {
        inFlight.current = false;
        setBusy(false);
      }
    }
  };
  const loadList = (after?: string) =>
    run(async () => {
      const result = pageSchema.parse(
        await request({
          action: "list_catalog_cases",
          limit: 50,
          ...(after ? { after_id: after } : {}),
        }),
      );
      if (
        after &&
        result.cases.some(
          (item) =>
            item.case_id === after ||
            items.some((old) => old.case_id === item.case_id),
        )
      )
        throw new Error("Repeated catalog page");
      setItems(after ? [...items, ...result.cases] : result.cases);
      setNextId(result.next_id);
    });
  // This component remounts for every actor/session/workspace/connection change.
  useEffect(() => {
    void loadList();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const prepare = (briefId: string) => {
    if (pending.current) return;
    return run(async () => {
      clearCurrent();
      setRecoveryId(null);
      const next = parsePrepared(
        await request({ action: "prepare_catalog_audit", brief_id: briefId }),
        workspaceId,
        briefId,
      );
      setSnapshot(next);
      setWritable(true);
      setSaved(false);
      setNotice(
        "Audit prepared from your saved assessment. Review it, then save when ready.",
      );
    });
  };
  const open = (caseId: string) => {
    if (pending.current && pending.current.case_id !== caseId) return;
    return run(async () => {
      clearCurrent();
      const result = parseReceipt(
        await request({ action: "read_catalog_case", case_id: caseId }),
        workspaceId,
        caseId,
      );
      // Never reuse protected fields from an earlier full receipt after a redacted read.
      setSnapshot(result.snapshot);
      setSaved(true);
      setRecoveryId(caseId);
      if (
        pending.current &&
        result.revision <= pending.current.expected_revision &&
        result.snapshot_usable_for_save
      ) {
        setWritable(false);
        setNotice(
          "The save is not confirmed yet. Retry the exact save before making changes.",
        );
        return;
      }
      pending.current = null;
      setUncertain(false);
      setWritable(
        result.snapshot_usable_for_save && canContinueAudit(result.snapshot),
      );
      setNotice(
        result.snapshot_usable_for_save
          ? canContinueAudit(result.snapshot)
            ? "Saved audit reopened."
            : "This saved case uses a different review workflow. You can read it here, but notes are disabled."
          : "Some evidence is no longer available. Protected content is withheld and this audit is read-only.",
      );
    });
  };
  const save = () => {
    if (!pending.current) {
      if (!snapshot || !writable || (saved && !note.trim())) return;
      let next: AuditSnapshot;
      try {
        next = saved
          ? appendAuditNote(snapshot, note)
          : structuredClone(snapshot);
      } catch {
        setWritable(false);
        setNotice(
          "This audit cannot be continued. Reopen the saved version to check its evidence.",
        );
        return;
      }
      pending.current = {
        action: "save_catalog_case",
        case_id: next.case_id,
        expected_revision: next.revision,
        idempotency_key: `catalog-audit:${crypto.randomUUID()}`,
        snapshot: next,
      };
    }
    const attempt = pending.current;
    setRecoveryId(attempt.case_id);
    return run(async () => {
      const result = parseReceipt(
        await request({ ...attempt }),
        workspaceId,
        attempt.case_id,
        attempt.expected_revision + 1,
      );
      pending.current = null;
      setUncertain(false);
      setNote("");
      setSnapshot(result.snapshot);
      setSaved(true);
      setWritable(
        result.snapshot_usable_for_save && canContinueAudit(result.snapshot),
      );
      setNotice(
        result.snapshot_usable_for_save
          ? "Audit saved. You can reopen it from Saved audits."
          : "Save returned restricted evidence. Protected content is withheld and this audit is read-only.",
      );
      setItems((current) => [
        {
          case_id: result.case_id,
          revision: result.revision,
          created_at: result.created_at,
          updated_at: result.created_at,
        },
        ...current.filter((item) => item.case_id !== result.case_id),
      ]);
    }, true);
  };
  return {
    items,
    nextId,
    snapshot,
    saved,
    writable,
    busy,
    notice,
    note,
    setNote,
    uncertain,
    recoveryId,
    loadList,
    prepare,
    open,
    save,
  };
}
