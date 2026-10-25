import Link from "next/link";

/** Preserve the viewed catalog while checking weekly-report availability; never start a run. */
const CatalogReportCta = ({ catalogId }: { catalogId: string }) => {
  return (
    <section
      aria-label="Next step"
      className="rounded-2xl bg-card p-6 sm:p-8 text-center shadow-[0_0_0_1px_var(--border),0_2px_4px_rgba(0,0,0,0.04)]"
    >
      <h2 className="font-heading text-lg font-bold text-foreground">
        Weekly catalog reports
      </h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
        Weekly reporting for this catalog isn&apos;t available yet. View details
        without starting a report.
      </p>
      <Link
        href={`/setup/tasks?${new URLSearchParams({ catalogId })}`}
        className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 font-heading text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        View weekly report availability
      </Link>
    </section>
  );
};

export default CatalogReportCta;
