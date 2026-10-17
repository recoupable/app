import type { DistributionComponent } from "./schemas";
import { computeDistribution } from "./computeDistribution";

export function describeConcentration(
  component: DistributionComponent,
  count: number,
): string {
  const result = computeDistribution(component, count);
  if (result.total === 0)
    return `The supplied records contain no ${component.measure.unit}.`;
  const contributors = result.top.filter((item) => item.value > 0);
  const names = new Intl.ListFormat("en", {
    style: "long",
    type: "conjunction",
  }).format(contributors.map((item) => item.label));
  const share = new Intl.NumberFormat("en", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(result.share);
  return `${names} ${contributors.length === 1 ? "accounts" : "account"} for ${share} of the ${component.measure.unit} in this selection.`;
}
