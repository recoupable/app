"use client";

import { Response } from "@/components/ai-elements/response";
import { useFirstTaskReport } from "@/hooks/useFirstTaskReport";
import FirstTaskConfirm from "./FirstTaskConfirm";

interface FirstTaskReportRunProps {
  sessionId: string;
  chatId: string;
  prompt: string;
  catalogName?: string;
}

/**
 * Streams the pre-run weekly report through the normal chat pipeline
 * and, only once it has finished, asks the one confirm question
 * (chat#1867 — show finished work before asking anything).
 */
const FirstTaskReportRun = ({
  sessionId,
  chatId,
  prompt,
  catalogName,
}: FirstTaskReportRunProps) => {
  const { reportText, phase } = useFirstTaskReport({
    sessionId,
    chatId,
    prompt,
  });

  return (
    <div className="flex w-full flex-col gap-4">
      <section
        aria-label="Your first weekly report"
        className="w-full rounded-xl bg-card p-6 shadow-[0px_0px_0px_1px_var(--border),0px_2px_4px_rgba(0,0,0,0.04)] dark:shadow-[0px_0px_0px_1px_var(--border),0px_2px_4px_rgba(0,0,0,0.2)]"
      >
        {phase === "generating" && (
          <p
            className="mb-3 animate-pulse text-xs uppercase tracking-[0.05em] text-muted-foreground"
            role="status"
          >
            Generating this week&apos;s report...
          </p>
        )}
        {phase === "error" ? (
          <p className="text-sm text-destructive" role="alert">
            We couldn&apos;t generate the report. Refresh the page to try again.
          </p>
        ) : (
          <Response>{reportText}</Response>
        )}
      </section>
      {phase === "ready" && (
        <section className="w-full rounded-xl bg-card p-6 shadow-[0px_0px_0px_1px_var(--border),0px_2px_4px_rgba(0,0,0,0.04)] dark:shadow-[0px_0px_0px_1px_var(--border),0px_2px_4px_rgba(0,0,0,0.2)]">
          <FirstTaskConfirm catalogName={catalogName} />
        </section>
      )}
    </div>
  );
};

export default FirstTaskReportRun;
