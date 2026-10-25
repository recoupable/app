import { useLayoutEffect, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { saveOpenedFileReplacement } from "@/lib/sandboxes/saveOpenedFileReplacement";
import { isOpenedRevisionCurrent } from "@/lib/sandboxes/isOpenedRevisionCurrent";
import { useSandboxAccountScope } from "./useSandboxAccountScope";
import type {
  GuardedReplacementOptions,
  PendingFileReplacement,
  ScopedReplacementFailure,
} from "@/lib/sandboxes/guardedFileTypes";
export function useGuardedFileReplacement(options: GuardedReplacementOptions) {
  const { getAccessToken } = usePrivy();
  const accountScope = useSandboxAccountScope();
  const latest = useRef(options);
  const mounted = useRef(false);
  useLayoutEffect(() => {
    latest.current = options;
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, [options]);
  const inFlight = useRef(false);
  const retained = useRef<PendingFileReplacement | null>(null);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<PendingFileReplacement | null>(null);
  const [failure, setFailure] = useState<ScopedReplacementFailure | null>(null);

  const replace = async (files: File[]) => {
    if (inFlight.current) return;
    if (
      !accountScope.ready ||
      accountScope.readOnly ||
      !accountScope.isCurrent()
    ) {
      setFailure({
        scope: options.scopeKey,
        message: "Files for a selected account are read-only.",
      });
      return;
    }
    const { opened, scopeKey, selectedPath, enabled } = latest.current;
    if (retained.current) {
      setFailure({
        scope: scopeKey,
        message:
          retained.current.opened.scopeKey === scopeKey
            ? "Keep a copy or discard the kept replacement before starting another."
            : "Return to the original account to keep or discard its replacement before starting another.",
      });
      return;
    }
    if (
      !enabled ||
      !opened ||
      opened.path !== selectedPath ||
      files.length !== 1 ||
      files[0].name !== opened.path.split("/").at(-1) ||
      opened.scopeKey !== scopeKey
    ) {
      setFailure({
        scope: scopeKey,
        message:
          "Open the file first, then drop one replacement with the same name.",
      });
      return;
    }
    const original = { file: files[0], opened: { ...opened } };
    retained.current = original;
    setPending(original);
    setFailure(null);
    inFlight.current = true;
    setSaving(true);
    const isCurrent = () =>
      mounted.current &&
      accountScope.isCurrent() &&
      isOpenedRevisionCurrent(latest.current, original.opened);
    try {
      await saveOpenedFileReplacement(getAccessToken, original, isCurrent);
      retained.current = null;
      setPending(null);
      if (isCurrent()) options.onSaved();
    } catch (error) {
      setFailure({
        scope: scopeKey,
        message:
          error instanceof Error
            ? error.message
            : "Replacement failed. Your file has been kept.",
      });
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  };
  return {
    replace,
    saving,
    hasPending: Boolean(pending),
    pending: pending?.opened.scopeKey === options.scopeKey ? pending : null,
    error: failure?.scope === options.scopeKey ? failure.message : null,
    discard: () => {
      if (
        !inFlight.current &&
        retained.current?.opened.scopeKey === latest.current.scopeKey
      ) {
        retained.current = null;
        setPending(null);
        setFailure(null);
      }
    },
  };
}
