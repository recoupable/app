import type { ReportInsight } from "@/lib/valuation/buildReportInsights";

interface CatalogReportInsightsProps {
  insights: ReportInsight[];
}

/**
 * Diagnosis + prescription per section: what's suppressing the value and
 * which Recoup behavior addresses it.
 */
const CatalogReportInsights = ({ insights }: CatalogReportInsightsProps) => {
  if (insights.length === 0) return null;

  return (
    <section aria-label="Diagnosis" className="flex flex-col gap-3">
      {insights.map((insight) => (
        <div
          key={insight.section}
          className="rounded-2xl bg-card p-4 sm:p-6 shadow-[0_0_0_1px_var(--border)]"
        >
          <h2 className="font-heading text-sm font-bold text-foreground">
            {insight.title}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {insight.diagnosis}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            <span className="font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground pr-2">
              Fix
            </span>
            {insight.prescription}
          </p>
        </div>
      ))}
    </section>
  );
};

export default CatalogReportInsights;
