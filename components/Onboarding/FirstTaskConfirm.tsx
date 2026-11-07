"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useConfirmFirstTask } from "@/hooks/useConfirmFirstTask";
import FirstTaskOffer from "./FirstTaskOffer";
import FirstTaskScheduled from "./FirstTaskScheduled";

interface FirstTaskConfirmProps {
  catalogName?: string;
  /** False when the account already has an active task: ask, don't create. */
  autoCreate: boolean;
}

/**
 * Shown once the pre-run report finishes (chat#1867). The monthly task is
 * created without a click — an account counts as onboarded only with a
 * recurring task (recoupable/app#1941) — and the old "get this every
 * Monday?" question becomes a way to turn it off. A second report in the
 * same visit (another artist) asks instead of creating. `autoCreate` is read
 * once, on mount, so a tasks refetch can never turn the question into a create.
 */
const FirstTaskConfirm = ({
  catalogName,
  autoCreate,
}: FirstTaskConfirmProps) => {
  const [autoCreateOnMount] = useState(autoCreate);
  const { confirm, turnOff, phase, task, hasStarted, isTurningOff } =
    useConfirmFirstTask({ catalogName, autoCreate: autoCreateOnMount });

  // Strict Mode runs effects twice; the ref keeps it to one create.
  const startedRef = useRef(false);
  useEffect(() => {
    if (!autoCreateOnMount || hasStarted || startedRef.current) return;
    startedRef.current = true;
    confirm();
  }, [autoCreateOnMount, hasStarted, confirm]);

  if (phase === "declined") {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Monthly report turned off. You can set it up again anytime from{" "}
        <Link href="/tasks" className="underline hover:text-foreground">
          Tasks
        </Link>
        .
      </p>
    );
  }

  if (phase === "offer") return <FirstTaskOffer onAccept={confirm} />;

  if (phase === "failed") {
    return (
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-foreground" role="alert">
          We couldn&apos;t set up your monthly report.
        </p>
        <button
          type="button"
          onClick={confirm}
          className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          Try again
        </button>
      </div>
    );
  }

  if (phase === "scheduled") {
    return (
      <FirstTaskScheduled
        task={task}
        onTurnOff={turnOff}
        isTurningOff={isTurningOff}
      />
    );
  }

  return (
    <p className="animate-pulse text-sm text-muted-foreground" role="status">
      Setting up your monthly report...
    </p>
  );
};

export default FirstTaskConfirm;
