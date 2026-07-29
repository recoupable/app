"use client";

import { FormEvent, useState } from "react";

interface CatalogReportEmailCaptureProps {
  catalogId: string;
  headlineValue?: number;
}

/**
 * "Email me this report" capture (chat#1902 item C3). Works for anonymous
 * viewers: the route it posts to is unauthenticated, and the valuation stays
 * fully visible on the page regardless of what happens here (capture
 * alongside, never in front). Success replaces the form.
 */
const CatalogReportEmailCapture = ({
  catalogId,
  headlineValue,
}: CatalogReportEmailCaptureProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    try {
      const response = await fetch(
        `/api/catalogs/${catalogId}/email-report`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, headline_value: headlineValue }),
        },
      );
      setStatus(response.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      aria-label="Email me this report"
      className="rounded-2xl bg-card p-6 sm:p-8 shadow-[0_0_0_1px_var(--border),0_2px_4px_rgba(0,0,0,0.04)]"
    >
      {status === "sent" ? (
        <p className="font-heading text-sm font-bold text-foreground">
          Report sent. Check your inbox.
        </p>
      ) : (
        <>
          <h2 className="font-heading text-sm font-bold text-foreground">
            Email me this report
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Get the link and the headline number in your inbox so you can come
            back to it anytime.
          </p>
          <form
            onSubmit={handleSubmit}
            className="mt-4 flex flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              aria-label="Your email address"
              className="w-full rounded-xl bg-background px-4 py-2.5 text-sm text-foreground shadow-[0_0_0_1px_var(--border)] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-primary px-5 py-2.5 font-heading text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {status === "sending" ? "Sending..." : "Send it"}
            </button>
          </form>
          {status === "error" && (
            <p role="alert" className="mt-2 text-sm text-muted-foreground">
              Could not send the email. Check the address and try again.
            </p>
          )}
        </>
      )}
    </section>
  );
};

export default CatalogReportEmailCapture;
