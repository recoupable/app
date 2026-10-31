import { useId } from "react";
import type { DistributionComponent } from "@/lib/intelligent-ui/representations/schemas";
import { computeDistribution } from "@/lib/intelligent-ui/representations/computeDistribution";
import { formatDistributionNumber } from "@/lib/intelligent-ui/representations/formatDistributionNumber";
import { formatReportingPeriod } from "@/lib/intelligent-ui/representations/formatReportingPeriod";

export default function DistributionView({
  component,
}: {
  component: DistributionComponent;
}) {
  const id = useId();
  const { ranked, maximum, total } = computeDistribution(component);
  return (
    <figure
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-basis`}
      className="py-2"
    >
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id={`${id}-title`} className="text-lg font-medium tracking-tight">
          {component.title}
        </h2>
        <span className="text-xs text-muted-foreground">
          {component.measure.label}
        </span>
      </div>
      <ol
        className="space-y-3.5"
        aria-label={`${component.measure.label} by record, highest first`}
      >
        {ranked.map((item) => (
          <li
            key={item.id}
            className="grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-x-3 gap-y-1.5 sm:grid-cols-[9rem_minmax(0,1fr)_max-content]"
          >
            <span className="text-sm leading-5 break-words">{item.label}</span>
            <div
              className="col-span-2 row-start-2 h-2 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:h-6"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-r-[3px] bg-brand-link"
                style={{
                  width: `${maximum === 0 ? 0 : (item.value / maximum) * 100}%`,
                }}
              />
            </div>
            <span className="col-start-2 row-start-1 text-right font-mono text-xs tabular-nums sm:col-start-3">
              {formatDistributionNumber(item.value)}
              <span className="sr-only"> {component.measure.unit}</span>
            </span>
          </li>
        ))}
      </ol>
      <figcaption
        id={`${id}-basis`}
        className="mt-6 space-y-1 text-xs leading-5 text-muted-foreground"
      >
        <p>
          {formatDistributionNumber(total)} supplied {component.measure.unit} ·{" "}
          {formatReportingPeriod(
            component.measure.periodStart,
            component.measure.periodEnd,
          )}
        </p>
        <p>
          {component.measure.population}.{" "}
          {component.complete
            ? "Complete supplied selection."
            : `Partial: ${component.items.length} of ${component.totalCount} records. Bars compare supplied records only.`}
        </p>
      </figcaption>
    </figure>
  );
}
