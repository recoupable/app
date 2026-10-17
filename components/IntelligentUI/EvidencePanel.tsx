"use client";

import { useEffect, useId, useRef } from "react";
import { ArrowUpRight, FileSearch, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Evidence } from "@/lib/intelligent-ui/schema";

interface EvidencePanelProps {
  evidence: Evidence | null;
  onClose: () => void;
  focusRequest?: number;
}

const kinds = {
  observed: "Observed",
  submitted: "Submitted",
  derived: "Derived",
  proposed: "Proposed",
};
const statuses = {
  current: "Current",
  partial: "Partial",
  withdrawn: "Withdrawn",
};

const EvidencePanel = ({
  evidence,
  onClose,
  focusRequest = 0,
}: EvidencePanelProps) => {
  const headingId = useId();
  const panel = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (focusRequest > 0 && heading.current) {
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLElement &&
        !panel.current?.contains(activeElement)
      ) {
        returnFocus.current = activeElement;
      }
      heading.current.focus({ preventScroll: true });
      heading.current.scrollIntoView?.({ block: "nearest" });
    }
  }, [focusRequest]);

  let safeHref: string | undefined;
  const observedAt = evidence ? new Date(evidence.observedAt) : null;
  const hasValidObservedAt =
    observedAt !== null && Number.isFinite(observedAt.getTime());
  if (evidence?.href) {
    try {
      const url = new URL(evidence.href);
      if (url.protocol === "https:" && !url.username && !url.password)
        safeHref = url.href;
    } catch {
      // The renderer also fails closed if a caller bypasses schema validation.
    }
  }

  return (
    <aside
      ref={panel}
      aria-labelledby={headingId}
      className="min-w-0 rounded-2xl bg-card p-5 shadow-[0_0_0_1px_var(--border)] sm:p-6"
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileSearch aria-hidden="true" className="size-4" strokeWidth={1.5} />
          <p className="font-mono text-[10px] uppercase tracking-wider">
            Evidence inspector
          </p>
        </div>
        {evidence && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close evidence inspector"
            className="-mr-2 min-h-11 min-w-11 focus-visible:ring-2"
            onClick={() => {
              onClose();
              if (returnFocus.current?.isConnected) returnFocus.current.focus();
            }}
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        )}
      </div>

      {evidence ? (
        <>
          <h2
            ref={heading}
            id={headingId}
            tabIndex={-1}
            className="break-words rounded-sm text-lg font-medium leading-snug tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {evidence.label}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
              {kinds[evidence.kind]}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              {statuses[evidence.status]}
            </span>
          </div>
          <dl className="mt-6 space-y-4 text-xs">
            <div>
              <dt className="text-muted-foreground">Source</dt>
              <dd className="mt-1 break-words font-medium">
                {evidence.sourceLabel}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Observed at</dt>
              <dd className="mt-1 font-medium">
                {hasValidObservedAt ? (
                  <time dateTime={evidence.observedAt}>
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "UTC",
                    }).format(observedAt)}{" "}
                    UTC
                  </time>
                ) : (
                  <span>Date unavailable</span>
                )}
              </dd>
            </div>
          </dl>
          <div className="my-6 h-px bg-border" />
          {evidence.status === "withdrawn" ? (
            <p className="mb-4 rounded-xl bg-muted p-3 text-xs leading-5 text-muted-foreground">
              This source has been withdrawn. It remains visible for context and
              should not support a current decision.
            </p>
          ) : evidence.status === "partial" ? (
            <p className="mb-4 rounded-xl bg-muted p-3 text-xs leading-5 text-muted-foreground">
              This source is incomplete. Check what is missing before relying on
              it.
            </p>
          ) : null}
          <p className="whitespace-pre-wrap break-words text-sm leading-7 [overflow-wrap:anywhere]">
            {evidence.text}
          </p>
          {safeHref && (
            <a
              href={safeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-brand-link underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Open source <ArrowUpRight aria-hidden="true" className="size-4" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </>
      ) : (
        <>
          <h2 id={headingId} className="text-lg font-medium tracking-tight">
            Follow the evidence.
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Choose a source beside a summary, metric, or record to see where it
            came from and what it supports.
          </p>
          <p className="mt-6 rounded-xl bg-secondary p-4 text-xs leading-6 text-secondary-foreground">
            An observation, an estimate, and a proposal can look alike. Their
            source and status help you tell them apart.
          </p>
        </>
      )}
    </aside>
  );
};

export default EvidencePanel;
