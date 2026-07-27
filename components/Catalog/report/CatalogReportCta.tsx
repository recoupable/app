import Link from "next/link";

/**
 * The report's ONE primary next action: set up the weekly report that keeps
 * this valuation measured (onboarding sequence advance, chat#1867). Routes to
 * the one-click first-task step — pre-runs the first weekly report, then
 * confirms the Monday schedule — instead of a blank /tasks page.
 *
 * Points at the canonical `/setup/tasks` route rather than the deleted
 * `/onboarding/first-task` mount (chat#1889, now a 308 in `next.config.mjs`).
 * This CTA is the landing page for both the marketing valuation funnel and the
 * valuation email, so it must route straight at the canonical step rather than
 * bouncing through a retired one.
 */
const CatalogReportCta = () => {
  return (
    <section
      aria-label="Next step"
      className="rounded-2xl bg-card p-6 sm:p-8 text-center shadow-[0_0_0_1px_var(--border),0_2px_4px_rgba(0,0,0,0.04)]"
    >
      <h2 className="font-heading text-lg font-bold text-foreground">
        Keep this number measured
      </h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
        This estimate goes stale the day you close the tab. A weekly report
        re-measures your catalog and emails you the trend.
      </p>
      <Link
        href="/setup/tasks"
        className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 font-heading text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Set up your weekly report
      </Link>
    </section>
  );
};

export default CatalogReportCta;
