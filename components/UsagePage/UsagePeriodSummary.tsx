import formatUsageDate from "@/lib/usage/formatUsageDate";

interface UsagePeriodSummaryProps {
  period: { from: string; to: string };
  totalUsd: string;
}

/** The period the list covers and what it added up to, as currency. */
const UsagePeriodSummary = ({ period, totalUsd }: UsagePeriodSummaryProps) => (
  <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
    <p className="text-sm text-muted-foreground">
      {formatUsageDate(period.from, false)} to {formatUsageDate(period.to, false)}
    </p>
    <p className="text-sm text-muted-foreground">
      Total <span className="font-heading text-2xl font-bold text-foreground">{totalUsd}</span>
    </p>
  </div>
);

export default UsagePeriodSummary;
