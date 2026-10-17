import { useId } from "react";
import type { DistributionComponent } from "@/lib/intelligent-ui/representations/schemas";
import { computeDistribution } from "@/lib/intelligent-ui/representations/computeDistribution";

export default function DistributionView({
  component,
}: {
  component: DistributionComponent;
}) {
  const id = useId();
  const { ranked, maximum, total } = computeDistribution(component);
  const number = new Intl.NumberFormat("en");
  const date = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
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
            className="grid grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)_4.5rem] items-center gap-3 sm:grid-cols-[9rem_minmax(0,1fr)_5rem]"
          >
            <span className="text-sm leading-5 break-words">{item.label}</span>
            <div className="h-6" aria-hidden="true">
              <div
                className="h-full rounded-r-[3px] bg-brand-link"
                style={{
                  width: `${maximum === 0 ? 0 : (item.value / maximum) * 100}%`,
                }}
              />
            </div>
            <span className="text-right font-mono text-xs tabular-nums">
              {number.format(item.value)}
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
          {number.format(total)} supplied {component.measure.unit} ·{" "}
          {date.formatRange(
            new Date(`${component.measure.periodStart}T00:00:00Z`),
            new Date(`${component.measure.periodEnd}T00:00:00Z`),
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
